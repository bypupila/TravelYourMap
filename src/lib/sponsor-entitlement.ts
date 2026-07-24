import { NextResponse } from "next/server";
import {
  getSponsorEntitlementForUser,
  SPONSOR_UPGRADE_REQUIRED,
} from "@/lib/subscription-entitlements";

export async function requireSponsorEntitlement(ownerUserId: string) {
  const entitlement = await getSponsorEntitlementForUser(ownerUserId);
  return entitlement.allowed
    ? null
    : NextResponse.json(SPONSOR_UPGRADE_REQUIRED, { status: 403 });
}
