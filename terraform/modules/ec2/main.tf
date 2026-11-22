# EC2 Module: Single Docker Compose Host on Amazon Linux 2023

data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_instance" "app" {
  ami                  = data.aws_ami.amazon_linux_2023.id
  instance_type        = var.instance_type
  subnet_id            = var.subnet_id
  vpc_security_group_ids = [var.security_group_id]
  iam_instance_profile = var.instance_profile_name
  key_name             = var.key_name

  # Encrypted EBS Root Volume (20GB gp3 - Free Tier optimal)
  root_block_device {
    volume_size           = 20
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
    tags = {
      Name = "${var.environment}-ticketdesk-root-volume"
    }
  }

  user_data = <<-EOF
              #!/bin/bash
              set -ex

              # 1. Allocate 2GB Swap space for seamless microservices execution on t3.micro
              if ! swapon --show | grep -q "/swapfile"; then
                dd if=/dev/zero of=/swapfile bs=1M count=2048
                chmod 600 /swapfile
                mkswap /swapfile
                swapon /swapfile
                echo '/swapfile none swap sw 0 0' >> /etc/fstab
              fi

              # 2. System Updates
              dnf update -y

              # 3. Install Docker & Docker Compose Plugin
              dnf install -y docker git
              systemctl enable --now docker
              usermod -aG docker ec2-user

              # Install Docker Compose & Buildx CLI Plugins
              DOCKER_CONFIG=/usr/local/lib/docker/cli-plugins
              mkdir -p $DOCKER_CONFIG
              curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 -o $DOCKER_CONFIG/docker-compose
              chmod +x $DOCKER_CONFIG/docker-compose
              curl -SL https://github.com/docker/buildx/releases/download/v0.19.3/buildx-v0.19.3.linux-amd64 -o $DOCKER_CONFIG/docker-buildx
              chmod +x $DOCKER_CONFIG/docker-buildx

              # 4. Create Application Directory & Environment
              mkdir -p /opt/ticketdesk
              chown -R ec2-user:ec2-user /opt/ticketdesk

              echo "TicketDesk EC2 Provisioned successfully at $(date)" > /var/log/ticketdesk-bootstrap.log
              EOF

  tags = {
    Name = "${var.environment}-ticketdesk-app-server"
  }
}
