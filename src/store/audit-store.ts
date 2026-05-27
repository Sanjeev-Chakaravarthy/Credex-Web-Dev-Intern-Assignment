import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  AITool,
  AuditInput,
  AuditResult,
  ToolInput,
  UseCase,
} from "@/lib/audit-engine/types";

interface AuditFormState {
  // Selected tools
  selectedTools: AITool[];
  // Per-tool configuration
  toolConfigs: Record<
    string,
    { plan: string; monthlySpend: number; seatCount: number }
  >;
  // Global settings
  teamSize: number;
  primaryUseCase: UseCase;
  // Current step
  currentStep: number;
  // Audit results
  auditResult: AuditResult | null;
  aiSummary: string | null;
  // Actions
  toggleTool: (tool: AITool) => void;
  setToolConfig: (
    tool: AITool,
    config: { plan?: string; monthlySpend?: number; seatCount?: number }
  ) => void;
  setTeamSize: (size: number) => void;
  setPrimaryUseCase: (useCase: UseCase) => void;
  setCurrentStep: (step: number) => void;
  setAuditResult: (result: AuditResult) => void;
  setAiSummary: (summary: string) => void;
  getAuditInput: () => AuditInput;
  reset: () => void;
}

const DEFAULT_TOOL_CONFIG = { plan: "", monthlySpend: 0, seatCount: 1 };

export const useAuditStore = create<AuditFormState>()(
  persist(
    (set, get) => ({
      selectedTools: [],
      toolConfigs: {},
      teamSize: 1,
      primaryUseCase: "coding" as UseCase,
      currentStep: 0,
      auditResult: null,
      aiSummary: null,

      toggleTool: (tool) =>
        set((state) => {
          const isSelected = state.selectedTools.includes(tool);
          if (isSelected) {
            const newConfigs = { ...state.toolConfigs };
            delete newConfigs[tool];
            return {
              selectedTools: state.selectedTools.filter((t) => t !== tool),
              toolConfigs: newConfigs,
            };
          }
          return {
            selectedTools: [...state.selectedTools, tool],
            toolConfigs: {
              ...state.toolConfigs,
              [tool]: { ...DEFAULT_TOOL_CONFIG },
            },
          };
        }),

      setToolConfig: (tool, config) =>
        set((state) => ({
          toolConfigs: {
            ...state.toolConfigs,
            [tool]: { ...(state.toolConfigs[tool] || DEFAULT_TOOL_CONFIG), ...config },
          },
        })),

      setTeamSize: (size) => set({ teamSize: size }),
      setPrimaryUseCase: (useCase) => set({ primaryUseCase: useCase }),
      setCurrentStep: (step) => set({ currentStep: step }),
      setAuditResult: (result) => set({ auditResult: result }),
      setAiSummary: (summary) => set({ aiSummary: summary }),

      getAuditInput: () => {
        const state = get();
        const tools: ToolInput[] = state.selectedTools.map((tool) => {
          const config = state.toolConfigs[tool] || DEFAULT_TOOL_CONFIG;
          return {
            tool,
            plan: config.plan,
            monthlySpend: config.monthlySpend,
            seatCount: config.seatCount,
          };
        });

        return {
          tools,
          teamSize: state.teamSize,
          primaryUseCase: state.primaryUseCase,
        };
      },

      reset: () =>
        set({
          selectedTools: [],
          toolConfigs: {},
          teamSize: 1,
          primaryUseCase: "coding",
          currentStep: 0,
          auditResult: null,
          aiSummary: null,
        }),
    }),
    {
      name: "aispendlens-audit",
      partialize: (state) => ({
        selectedTools: state.selectedTools,
        toolConfigs: state.toolConfigs,
        teamSize: state.teamSize,
        primaryUseCase: state.primaryUseCase,
        currentStep: state.currentStep,
        auditResult: state.auditResult,
        aiSummary: state.aiSummary,
      }),
    }
  )
);
