import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";

interface WelcomeEmailProps {
  name: string;
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to AgentStack</Preview>
      <Body style={{ fontFamily: "ui-sans-serif, sans-serif", backgroundColor: "#f5f5f5" }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "32px", borderRadius: "8px" }}>
          <Heading style={{ fontSize: "20px" }}>Welcome, {name}!</Heading>
          <Text style={{ fontSize: "14px", color: "#404040" }}>
            Your account and personal organization have been created. You can now invite
            teammates, explore the dashboard, and start building.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default WelcomeEmail;
