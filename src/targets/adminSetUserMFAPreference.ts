import {
    AdminSetUserMFAPreferenceRequest,
    AdminSetUserMFAPreferenceResponse,
} from "aws-sdk/clients/cognitoidentityserviceprovider";
import {UserNotFoundError} from "../errors";
import {Services} from "../services";
import {Target} from "./Target";

export type AdminSetUserMFAPreferenceTarget = Target<AdminSetUserMFAPreferenceRequest,
    AdminSetUserMFAPreferenceResponse>;

type AdminSetUserMFAPreferenceServices = Pick<Services, "clock" | "cognito">;

export const AdminSetUserMFAPreference =
    ({
         cognito,
         clock,
     }: AdminSetUserMFAPreferenceServices): AdminSetUserMFAPreferenceTarget =>
        async (ctx, req) => {
            const userPool = await cognito.getUserPool(ctx, req.UserPoolId);
            const user = await userPool.getUserByUsername(ctx, req.Username);
            if (!user) {
                throw new UserNotFoundError("User does not exist");
            }

            await userPool.saveUser(ctx, {
                ...user,
                PreferredMfaSetting: req.SMSMfaSettings.PreferredMfa ? "SMS_MFA" : (req.SoftwareTokenMfaSettings.PreferredMfa ? "SOFTWARE_TOKEN_MFA" : null),
                UserLastModifiedDate: clock.get()
            });

            return {};
        };