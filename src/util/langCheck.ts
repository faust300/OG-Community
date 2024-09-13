import { OGRequest } from "src/extensions/auth/auth.request";

export default async (req: OGRequest) => {
    if ( ! req) return "EN";

    return req.headers['accepted-language'] ?? "EN";
}