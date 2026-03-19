pipeline {
    agent any

    environment {
        AWS_REGION        = "us-east-1"
        ECR_REGISTRY      = credentials('ecr-registry')        // e.g. 123456789012.dkr.ecr.us-east-1.amazonaws.com
        IMAGE_NAME        = "wildfire-tracker"
        IMAGE_TAG         = "${BUILD_NUMBER}"
        EKS_CLUSTER_NAME  = "wildfire-tracker-dev"
        HELM_RELEASE_NAME = "wildfire-tracker"
        HELM_NAMESPACE    = "default"
        SONAR_HOME        = tool "Sonar"
    }

    stages {
        stage("Checkout") {
            steps {
                git(
                    url: "https://github.com/GirishDevnath-Torch/wildfire-tracker.git",
                    branch: "main",
                    credentialsId: "github-credentials"
                )
            }
        }

        stage("Install Dependencies") {
            steps {
                sh "npm ci --silent"
            }
        }

        stage("Lint") {
            steps {
                sh "npm run lint"
            }
        }

        stage("SonarQube Analysis") {
            steps {
                withSonarQubeEnv("Sonar") {
                    sh "$SONAR_HOME/bin/sonar-scanner -Dsonar.projectName=wildfire-tracker -Dsonar.projectKey=wildfire-tracker"
                }
            }
        }

        stage("Trivy Filesystem Scan") {
            steps {
                sh "trivy fs --format table -o trivy-fs-report.html ."
            }
        }

        stage("Docker Build") {
            steps {
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
                sh "docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${ECR_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
                sh "docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${ECR_REGISTRY}/${IMAGE_NAME}:latest"
            }
        }

        stage("Trivy Image Scan") {
            steps {
                sh "trivy image --format table -o trivy-image-report.html ${ECR_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
            }
        }

        stage("Push to ECR") {
            steps {
                withAWS(region: "${AWS_REGION}", credentials: "aws-credentials") {
                    sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}"
                    sh "docker push ${ECR_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
                    sh "docker push ${ECR_REGISTRY}/${IMAGE_NAME}:latest"
                }
            }
        }

        stage("Deploy to EKS") {
            steps {
                withAWS(region: "${AWS_REGION}", credentials: "aws-credentials") {
                    sh "aws eks update-kubeconfig --region ${AWS_REGION} --name ${EKS_CLUSTER_NAME}"
                    sh """
                        helm upgrade --install ${HELM_RELEASE_NAME} ./helm \
                          --namespace ${HELM_NAMESPACE} \
                          --set image.repository=${ECR_REGISTRY}/${IMAGE_NAME} \
                          --set image.tag=${IMAGE_TAG} \
                          --wait --timeout 5m
                    """
                }
            }
        }
    }

    post {
        always {
            publishHTML([
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                reportDir: ".",
                reportFiles: "trivy-fs-report.html,trivy-image-report.html",
                reportName: "Security Scan Reports"
            ])
            cleanWs()
        }
        success {
            echo "Deployment successful — Image: ${ECR_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
        }
        failure {
            echo "Pipeline failed. Check logs above."
        }
    }
}
