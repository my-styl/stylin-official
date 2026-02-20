import { WorkflowResponse, createWorkflow } from "@medusajs/workflows-sdk";

import { createBrandStep } from "../steps";

type CreateBrandWorkflowInput = {
  name: string;
  handle: string;
  description?: string | null;
  logo?: string | null;
  seller_id: string;
};

export const createBrandWorkflow = createWorkflow(
  "create-brand",
  function (input: CreateBrandWorkflowInput) {
    return new WorkflowResponse(createBrandStep(input));
  }
);
