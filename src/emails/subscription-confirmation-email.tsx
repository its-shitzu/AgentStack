import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";

interface SubscriptionConfirmationEmailProps {
  name: string;
  planName: string;
}

export function SubscriptionConfirmationEmail({
  name,
  planName,
}: SubscriptionConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your {planName} subscription is active</Preview>
      <Body style={{ fontFamily: "ui-sans-serif, sans-serif", backgroundColor: "#f5f5f5" }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "32px", borderRadius: "8px" }}>
          <Heading style={{ fontSize: "20px" }}>Thanks, {name}!</Heading>
          <Text style={{ fontSize: "14px", color: "#404040" }}>
            Your subscription to the <strong>{planName}</strong> plan is now active. You can
            manage your billing details at any time from the dashboard.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default SubscriptionConfirmationEmail;
