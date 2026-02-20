import { WorkflowResponse, createWorkflow } from "@medusajs/workflows-sdk";

import { deleteBrandStep } from "../steps";

type DeleteBrandWorkflowInput = {
  id: string;
};

export const deleteBrandWorkflow = createWorkflow(
  "delete-brand",
  function (input: DeleteBrandWorkflowInput) {
    return new WorkflowResponse(deleteBrandStep(input));
  }
);
