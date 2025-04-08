"use client";

import { fetchWithRetry } from "@/utils/supabaseUtils";
import { sanitizeLogInput } from "@/utils/inputUtils";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

export async function hasUser(
  userId: string,
  supabase: SupabaseClient<Database>
) {
  const sanitizedUserId = sanitizeLogInput(userId);
  console.log(
    `AuthProviderService: Ensuring user record for ${sanitizedUserId}`
  );

  const query = supabase.from("users").select("id").eq("id", userId).single();
  const { data, error } = await fetchWithRetry(query, {
    maxRetries: 3,
    timeoutMs: 3000,
    exponentialBackoff: false,
    onRetry: (attempt, error) => {
      const sanitizedAttempt = sanitizeLogInput(attempt.toString());
      const sanitizedError = sanitizeLogInput(error.message);
      console.log(
        `AuthProviderService Attempt ${sanitizedAttempt}: Retrying due to error: ${sanitizedError}`
      );
    },
  });
  if (error) {
    console.error("AuthProviderService: Error fetching user record:", error);
    throw error;
  }

  return !!data;
}

export async function createUser(
  userId: string,
  supabase: SupabaseClient<Database>
): Promise<{ error: any }> {
  const sanitizedUserId = sanitizeLogInput(userId);
  console.log(
    `AuthProviderService: Creating user record for ${sanitizedUserId}`
  );

  const query = supabase.rpc("create_user_record", {
    user_id: userId,
    created_timestamp: new Date().toISOString(),
  });
  const { data, error } = await query;

  if (error) {
    const sanitizedError = sanitizeLogInput(error.message);
    console.error(
      "AuthProviderService: Error creating user record:",
      sanitizedError
    );
    return { error: error };
  }

  if (!data) {
    console.error(
      "AuthProviderService: User record not created due to internal exception"
    );
    return { error: "User record not created due to internal exception" };
  } else {
    console.log("AuthProviderService: User record created successfully");
    return { error: null };
  }
}
