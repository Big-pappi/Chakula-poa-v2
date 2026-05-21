"use client";

import { useState, useEffect, useCallback } from "react";
import { superAdmin } from "@/lib/api/endpoints";

export interface SystemSettings {
  system_name: string;
  support_email: string;
  default_currency: string;
  timezone: string;
  maintenance_mode: boolean;
  platform_fee_percentage: number;
  payment_enabled: boolean;
  mpesa_enabled: boolean;
  airtel_money_enabled: boolean;
  tigopesa_enabled: boolean;
  halopesa_enabled: boolean;
  mix_by_yas_enabled: boolean;
  bank_transfer_enabled: boolean;
  ussd_code: string;
  session_timeout: number;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  admin_alerts: boolean;
  subscription_reminders: boolean;
  two_factor_auth: boolean;
  password_policy: string;
  api_rate_limit: number;
  api_documentation_public: boolean;
}

const defaultSettings: SystemSettings = {
  system_name: "Chakula Poa",
  support_email: "support@chakulapoa.co.tz",
  default_currency: "TZS",
  timezone: "Africa/Dar_es_Salaam",
  maintenance_mode: false,
  platform_fee_percentage: 10,
  payment_enabled: true,
  mpesa_enabled: true,
  airtel_money_enabled: true,
  tigopesa_enabled: true,
  halopesa_enabled: true,
  mix_by_yas_enabled: true,
  bank_transfer_enabled: true,
  ussd_code: "*150*00#",
  session_timeout: 30,
  email_notifications: true,
  sms_notifications: true,
  push_notifications: true,
  admin_alerts: true,
  subscription_reminders: true,
  two_factor_auth: false,
  password_policy: "medium",
  api_rate_limit: 100,
  api_documentation_public: false,
};

export function useSystemSettings() {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from Django backend API
  const fetchSettings = useCallback(async () => {
    try {
      const response = await superAdmin.getSystemSettings();
      if (response.data) {
        // Merge with defaults for any missing settings
        const parsedSettings: Partial<SystemSettings> = {};
        for (const [key, value] of Object.entries(response.data)) {
          if (key in defaultSettings) {
            parsedSettings[key as keyof SystemSettings] = value as SystemSettings[keyof SystemSettings];
          }
        }
        setSettings({ ...defaultSettings, ...parsedSettings });
      }
    } catch (error) {
      console.error("Failed to load system settings from API:", error);
      // Keep default settings on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSetting = useCallback(async (key: keyof SystemSettings, value: unknown) => {
    try {
      const response = await superAdmin.updateSystemSetting(key, value);
      if (response.data || !response.error) {
        setSettings((prev) => ({ ...prev, [key]: value }));
        // Dispatch event for other components to know settings changed
        window.dispatchEvent(new CustomEvent("system-settings-change", { detail: { key, value } }));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to update system setting:", error);
      return false;
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<SystemSettings>) => {
    // Update multiple settings at once
    const updates = Object.entries(newSettings).map(([key, value]) => 
      updateSetting(key as keyof SystemSettings, value)
    );
    await Promise.all(updates);
  }, [updateSetting]);

  // Listen for setting changes from other components
  useEffect(() => {
    const handleSettingsChange = (e: CustomEvent<{ key: string; value: unknown }>) => {
      const { key, value } = e.detail;
      if (key in defaultSettings) {
        setSettings((prev) => ({ ...prev, [key]: value }));
      }
    };

    window.addEventListener("system-settings-change" as unknown as keyof WindowEventMap, handleSettingsChange as EventListener);
    return () => window.removeEventListener("system-settings-change" as unknown as keyof WindowEventMap, handleSettingsChange as EventListener);
  }, []);

  return {
    settings,
    isLoading,
    updateSetting,
    updateSettings,
    refetch: fetchSettings,
    isMaintenanceMode: settings.maintenance_mode,
    isPaymentEnabled: settings.payment_enabled,
    platformFee: settings.platform_fee_percentage,
    systemName: settings.system_name,
  };
}

// Simple hook just for maintenance mode check (lightweight - hits dedicated endpoint)
export function useMaintenanceMode() {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkMaintenanceMode = async () => {
      try {
        const response = await superAdmin.getMaintenanceStatus();
        if (response.data) {
          setIsMaintenanceMode(response.data.maintenance_mode === true);
        }
      } catch (error) {
        console.error("Failed to check maintenance mode:", error);
        // Default to false if API fails (don't block users)
        setIsMaintenanceMode(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkMaintenanceMode();

    // Poll for changes every 30 seconds (in case super admin turns off maintenance)
    const interval = setInterval(checkMaintenanceMode, 30000);

    // Also listen for local setting changes
    const handleSettingsChange = (e: CustomEvent<{ key: string; value: unknown }>) => {
      if (e.detail.key === "maintenance_mode") {
        setIsMaintenanceMode(e.detail.value === true);
      }
    };

    window.addEventListener("system-settings-change" as unknown as keyof WindowEventMap, handleSettingsChange as EventListener);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener("system-settings-change" as unknown as keyof WindowEventMap, handleSettingsChange as EventListener);
    };
  }, []);

  return { isMaintenanceMode, isLoading };
}
