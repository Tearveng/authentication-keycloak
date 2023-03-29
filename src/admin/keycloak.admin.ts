import KcAdminClient from "@keycloak/keycloak-admin-client";

const kcAdminClient = new KcAdminClient();

const initKeycloak = async (): Promise<void> => {
  return await kcAdminClient.auth({
    username: "admin",
    password: "admin",
    grantType: "password",
    clientId: "admin-cli",
    totp: "123456", // optional Time-based One-time Password if OTP is required in authentication flow
  });
};
