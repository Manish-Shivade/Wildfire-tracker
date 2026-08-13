terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Remote state backend. Requires the bucket + DynamoDB lock table
  # created by terraform/bootstrap (see terraform/bootstrap/main.tf).
  # Uncomment, then run: terraform init -migrate-state
  # backend "s3" {
  #   bucket         = "wildfire-tracker-tfstate"
  #   key            = "wildfire-tracker/terraform.tfstate"
  #   region         = "us-east-1"
  #   dynamodb_table = "wildfire-tracker-tfstate-lock"
  #   encrypt        = true
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "wildfire-tracker"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
