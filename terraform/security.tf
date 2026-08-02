resource "aws_security_group" "k8s" {

  name = "kubernetes"

  vpc_id = aws_vpc.main.id

  ingress {

    from_port = 22

    to_port = 22

    protocol = "tcp"

    cidr_blocks = ["0.0.0.0/0"]

  }

  ingress {

    from_port = 6443

    to_port = 6443

    protocol = "tcp"

    cidr_blocks = ["10.0.0.0/16"]

  }

  ingress {

    from_port = 0

    to_port = 65535

    protocol = "tcp"

    self = true

  }

  ingress {

    from_port = -1

    to_port = -1

    protocol = "icmp"

    self = true

  }

  egress {

    from_port = 0

    to_port = 0

    protocol = "-1"

    cidr_blocks = ["0.0.0.0/0"]

  }

}

data "aws_ami" "ubuntu" {

  most_recent = true

  owners = ["099720109477"]

  filter {

    name = "name"

    values = [

      "ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"

    ]

  }

}