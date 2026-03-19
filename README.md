# 🔥 Wildfire Tracker

A real-time wildfire monitoring application built with React and the NASA EONET API, deployed on AWS EKS using a full DevOps pipeline.

---

## Architecture Overview

```
NASA EONET API → React (Vite) → Docker → ECR → EKS → Helm
                                   ↑
                              Jenkins CI/CD
                                   ↑
                         SonarQube + Trivy Scan
                                   ↑
                        Terraform (VPC + EKS + ECR)
                                   ↑
                     Prometheus + Grafana Monitoring
```

---

## Project Structure

```
wildfire-tracker/
├── src/                         # React application source
│   ├── App.tsx                  # Root component (layout)
│   ├── components/
│   │   ├── Header.tsx           # Status filter bar
│   │   ├── Map.tsx              # Leaflet map with fire markers
│   │   └── EventCard.tsx        # Sidebar event list cards
│   ├── types/index.ts           # TypeScript types (EONET API)
│   └── utils/api.ts             # NASA EONET API client
├── Dockerfile                   # Multi-stage build (Node → Nginx)
├── nginx.conf                   # SPA routing + /health endpoint
├── helm/                        # Helm chart
│   ├── Chart.yaml
│   ├── values.yaml
│   └── templates/
│       ├── deployment.yaml
│       ├── service.yaml
│       ├── ingress.yaml
│       └── hpa.yaml
├── terraform/                   # AWS infrastructure
│   ├── provider.tf
│   ├── variables.tf
│   ├── vpc.tf                   # VPC, subnets, NAT gateways
│   ├── eks.tf                   # EKS cluster + managed node group
│   ├── ecr.tf                   # ECR repository
│   └── outputs.tf
├── monitoring/
│   ├── prometheus-values.yaml   # kube-prometheus-stack values
│   └── alerts.yaml              # PrometheusRule alert definitions
└── Jenkinsfile                  # CI/CD pipeline
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20+ |
| Docker | 24+ |
| Terraform | 1.5+ |
| AWS CLI | 2+ |
| kubectl | 1.29+ |
| Helm | 3.12+ |

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev

# Lint
npm run lint

# Build for production
npm run build
```

---

## Docker

```bash
# Build image
docker build -t wildfire-tracker:latest .

# Run locally
docker run -p 8080:80 wildfire-tracker:latest

# Open http://localhost:8080
```

---

## Infrastructure — Terraform

```bash
cd terraform/

# Initialise
terraform init

# Preview changes
terraform plan -var="environment=dev"

# Apply
terraform apply -var="environment=dev"

# Get ECR URL
terraform output ecr_repository_url

# Configure kubectl
$(terraform output -raw configure_kubectl)
```

**Resources created:**
- VPC with public + private subnets across 2 AZs
- Internet Gateway + NAT Gateways
- EKS cluster (Kubernetes 1.29)
- Managed Node Group (`t3.medium`, 2–4 nodes)
- ECR repository with lifecycle policy (keep last 10 images)

---

## Deploy — Helm

```bash
# Push image to ECR first
ECR_URL=$(cd terraform && terraform output -raw ecr_repository_url)

aws ecr get-login-password --region us-east-1 \
  | docker login --username AWS --password-stdin $ECR_URL

docker tag wildfire-tracker:latest $ECR_URL:latest
docker push $ECR_URL:latest

# Deploy with Helm
helm upgrade --install wildfire-tracker ./helm \
  --set image.repository=$ECR_URL \
  --set image.tag=latest \
  --wait
```

---

## CI/CD — Jenkins

The [Jenkinsfile](Jenkinsfile) pipeline stages:

| Stage | Description |
|-------|-------------|
| Checkout | Pull from GitHub |
| Install | `npm ci` |
| Lint | ESLint check |
| SonarQube | Static code analysis |
| Trivy FS | Filesystem vulnerability scan |
| Docker Build | Build and tag image |
| Trivy Image | Container image vulnerability scan |
| Push to ECR | Authenticate and push |
| Deploy to EKS | `helm upgrade --install` |

**Jenkins credentials required:**
- `github-credentials` — GitHub token
- `aws-credentials` — AWS IAM credentials
- `ecr-registry` — ECR registry URL

---

## Monitoring

Install kube-prometheus-stack using the provided values:

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm upgrade --install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace \
  -f monitoring/prometheus-values.yaml

# Apply custom alert rules
kubectl apply -f monitoring/alerts.yaml
```

**Alerts configured:**
- `WildfireTrackerDown` — pod unreachable for >1 min (critical)
- `WildfireTrackerHighCPU` — CPU >80% for >5 min (warning)
- `WildfireTrackerHighMemory` — memory >200MB for >5 min (warning)
- `WildfireTrackerPodRestarting` — repeated restarts (warning)

---

## Data Source

This app uses the free [NASA EONET API v3](https://eonet.gsfc.nasa.gov/docs/v3) — no API key required.

---

## License

MIT
