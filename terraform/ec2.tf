# control plane
resource "aws_instance" "control_plane" {

  ami           = data.aws_ami.ubuntu.id

  instance_type = var.instance_type

  subnet_id = aws_subnet.public.id

  key_name = var.key_name

  vpc_security_group_ids = [

    aws_security_group.k8s.id

  ]

  root_block_device {

    volume_size = 50

    volume_type = "gp3"

  }

  tags = {

    Name = "control-plane"

  }

}

# woker1
resource "aws_instance" "worker" {

  count = 2

  ami = data.aws_ami.ubuntu.id

  instance_type = var.instance_type

  subnet_id = aws_subnet.public.id

  key_name = var.key_name

  vpc_security_group_ids = [

    aws_security_group.k8s.id

  ]

  root_block_device {

    volume_size = 50

    volume_type = "gp3"

  }

  tags = {

    Name = "worker-${count.index+1}"

  }

}