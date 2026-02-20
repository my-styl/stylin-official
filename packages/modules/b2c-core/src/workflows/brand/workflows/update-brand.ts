import { WorkflowResponse, createWorkflow } from "@medusajs/workflows-sdk";

import { updateBrandStep } from "../steps";

type UpdateBrandWorkflowInput = {
  id: string;
  name?: string;
  handle?: string;
  description?: string | null;
  logo?: string | null;
};

export const updateBrandWorkflow = createWorkflow(
  "update-brand",
  function (input: UpdateBrandWorkflowInput) {
    return new WorkflowResponse(updateBrandStep(input));
  }
);
