import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

export class FinalExamStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a VPC with CIDR 10.30.0.0/16
    const vpc = new ec2.Vpc(this, 'MyVpc', {
      cidr: '10.30.0.0/16',
    });

    // Create an EC2 instance in the VPC using a Public Subnet
    const ec2Instance = new ec2.Instance(this, 'MyEC2Instance', {
      vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: ec2.MachineImage.latestAmazonLinux({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
    });

    // Create an SQS Queue
    const queue = new sqs.Queue(this, 'MyQueue', {
      visibilityTimeout: cdk.Duration.seconds(300),
    });

    // Create an SNS Topic
    const topic = new sns.Topic(this, 'MyTopic');

    // Create an AWS Secrets Manager secret
    const secret = new secretsmanager.Secret(this, 'MySecret', {
      secretName: 'metrodb-secrets',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: 'Metro', // Replace with your username
          password: 'Metro123', // Replace with your password
        }),
        excludePunctuation: true,
        includeSpace: false,
        generateStringKey: 'password', // Specify which key should be generated
      },
    });

    // Grant permissions as needed for your specific use case

    // Example: Allow EC2 to send messages to the SQS Queue
    queue.grantSendMessages(ec2Instance);

    // Example: Allow SNS to publish messages to the SQS Queue
    // topic.grantPublish(queue);

    // Example: Grant EC2 instance access to the Secrets Manager secret
    secret.grantRead(ec2Instance);
  }
}
