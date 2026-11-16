"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  ValidationReport,
  ValidationRule,
  ValidationConfiguration,
  ValidationSeverity,
} from "@/types/hall-validation.types";
import {
  runValidationAction,
  loadValidationRulesAction,
  saveValidationConfigAction,
  validateBeforePublishAction,
} from "@/actions/hall-validation-actions";

interface UseHallValidationOptions {
  theatreId: string;
  layoutVersionId: string;
  autoValidate?: boolean;
}

function parseErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === "string") return err;
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message: unknown }).message || fallback);
  }
  return fallback;
}

export function useHallValidation({
  theatreId,
  layoutVersionId,
  autoValidate = false,
}: UseHallValidationOptions) {
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [rules, setRules] = useState<ValidationRule[]>([]);
  const [config, setConfig] = useState<ValidationConfiguration | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<"ALL" | ValidationSeverity>("ALL");

  /**
   * Run full validation on current layout version
   */
  const runValidation = useCallback(async (): Promise<ValidationReport | null> => {
    if (!theatreId || !layoutVersionId) return null;
    setIsValidating(true);
    setError(null);
    try {
      const res = await runValidationAction({
        layoutVersionId,
        theatreId,
      });

      if (res.success && res.data) {
        setReport(res.data);
        return res.data;
      } else {
        const errMsg = typeof res.error === "string" ? res.error : res.error?.message || "Failed to validate hall layout";
        setError(errMsg);
        return null;
      }
    } catch (err: unknown) {
      setError(parseErrorMessage(err, "Validation failed"));
      return null;
    } finally {
      setIsValidating(false);
    }
  }, [theatreId, layoutVersionId]);

  /**
   * Pre-publish gate validation
   */
  const validateBeforePublish = useCallback(async (): Promise<{
    canPublish: boolean;
    report: ValidationReport | null;
    error?: string;
  }> => {
    if (!theatreId || !layoutVersionId) {
      return { canPublish: false, report: null, error: "Missing context" };
    }
    setIsValidating(true);
    try {
      const res = await validateBeforePublishAction({
        layoutVersionId,
        theatreId,
      });

      if (res.success && res.data) {
        setReport(res.data);
        return { canPublish: res.data.canPublish, report: res.data };
      } else {
        const errMsg = typeof res.error === "string" ? res.error : res.error?.message || "Pre-publish validation failed";
        return {
          canPublish: false,
          report: null,
          error: errMsg,
        };
      }
    } catch (err: unknown) {
      return {
        canPublish: false,
        report: null,
        error: parseErrorMessage(err, "Publication validation failed"),
      };
    } finally {
      setIsValidating(false);
    }
  }, [theatreId, layoutVersionId]);

  /**
   * Load registered rules catalog
   */
  const loadRules = useCallback(async () => {
    if (!theatreId) return;
    try {
      const res = await loadValidationRulesAction({ theatreId });
      if (res.success && res.data) {
        setRules(res.data);
      }
    } catch (err: unknown) {
      console.error("Failed to load validation rules:", err);
    }
  }, [theatreId]);

  /**
   * Save configuration
   */
  const saveConfiguration = useCallback(
    async (updates: Partial<ValidationConfiguration>) => {
      if (!theatreId) return;
      try {
        const res = await saveValidationConfigAction({
          theatreId,
          ...updates,
        });
        if (res.success && res.data) {
          setConfig(res.data);
        }
      } catch (err: unknown) {
        setError(parseErrorMessage(err, "Failed to save validation configuration"));
      }
    },
    [theatreId]
  );

  // Auto-run if requested
  useEffect(() => {
    if (autoValidate && theatreId && layoutVersionId) {
      runValidation();
    }
  }, [autoValidate, theatreId, layoutVersionId, runValidation]);

  // Load rules catalog on mount
  useEffect(() => {
    loadRules();
  }, [loadRules]);

  // Filtered validation results based on severity selection
  const filteredResults = useMemo(() => {
    if (!report?.results) return [];
    if (filterSeverity === "ALL") return report.results;
    return report.results.filter((r) => r.severity === filterSeverity);
  }, [report?.results, filterSeverity]);

  const canPublish = report ? report.canPublish : false;
  const blockingErrorsCount = report ? report.summary.errorsCount : 0;
  const warningsCount = report ? report.summary.warningsCount : 0;

  return {
    report,
    rules,
    config,
    isValidating,
    error,
    filterSeverity,
    setFilterSeverity,
    filteredResults,
    canPublish,
    blockingErrorsCount,
    warningsCount,
    runValidation,
    validateBeforePublish,
    loadRules,
    saveConfiguration,
  };
}
