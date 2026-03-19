terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Uncomment after creating the S3 bucket for remote state
  # backend "s3" {
  #   bucket = "wildfire-tracker-tfstate"
  #   key    = "wildfire-tracker/terraform.tfstate"
  #   region = "us-east-1"
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
