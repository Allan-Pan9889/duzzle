export function getPaymentMethodLabel(method: string): string {
  switch (method) {
    case "COD":
      return "Cash on Delivery";
    case "SABPAISA":
      return "Online (SabPaisa)";
    case "RAZORPAY":
      return "Online";
    default:
      return method;
  }
}
