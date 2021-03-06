// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { CanonicalCode } from "@opentelemetry/api";
import { createSpan } from "../tracing";
import { PagedAsyncIterableIterator } from "@azure/core-paging";
import * as coreHttp from "@azure/core-http";
import * as Mappers from "../models/mappers";
import * as Parameters from "../models/parameters";
import { ArtifactsClient } from "../artifactsClient";
import { LROPoller, shouldDeserializeLRO } from "../lro";
import {
  DataFlowDebugSessionInfo,
  CreateDataFlowDebugSessionRequest,
  DataFlowDebugSessionCreateDataFlowDebugSessionResponse,
  DataFlowDebugSessionQueryDataFlowDebugSessionsByWorkspaceResponse,
  DataFlowDebugPackage,
  DataFlowDebugSessionAddDataFlowResponse,
  DeleteDataFlowDebugSessionRequest,
  DataFlowDebugCommandRequest,
  DataFlowDebugSessionExecuteCommandResponse,
  DataFlowDebugSessionQueryDataFlowDebugSessionsByWorkspaceNextResponse
} from "../models";

/** Class representing a DataFlowDebugSession. */
export class DataFlowDebugSession {
  private readonly client: ArtifactsClient;

  /**
   * Initialize a new instance of the class DataFlowDebugSession class.
   * @param client - Reference to the service client
   */
  constructor(client: ArtifactsClient) {
    this.client = client;
  }

  /**
   * Query all active data flow debug sessions.
   * @param options - The options parameters.
   */
  public listQueryDataFlowDebugSessionsByWorkspace(
    options?: coreHttp.OperationOptions
  ): PagedAsyncIterableIterator<DataFlowDebugSessionInfo> {
    const iter = this.queryDataFlowDebugSessionsByWorkspacePagingAll(options);
    return {
      next() {
        return iter.next();
      },
      [Symbol.asyncIterator]() {
        return this;
      },
      byPage: () => {
        return this.queryDataFlowDebugSessionsByWorkspacePagingPage(options);
      }
    };
  }

  private async *queryDataFlowDebugSessionsByWorkspacePagingPage(
    options?: coreHttp.OperationOptions
  ): AsyncIterableIterator<DataFlowDebugSessionInfo[]> {
    let result = await this._queryDataFlowDebugSessionsByWorkspace(options);
    yield result.value || [];
    let continuationToken = result.nextLink;
    while (continuationToken) {
      result = await this._queryDataFlowDebugSessionsByWorkspaceNext(continuationToken, options);
      continuationToken = result.nextLink;
      yield result.value || [];
    }
  }

  private async *queryDataFlowDebugSessionsByWorkspacePagingAll(
    options?: coreHttp.OperationOptions
  ): AsyncIterableIterator<DataFlowDebugSessionInfo> {
    for await (const page of this.queryDataFlowDebugSessionsByWorkspacePagingPage(options)) {
      yield* page;
    }
  }

  /**
   * Creates a data flow debug session.
   * @param request - Data flow debug session definition
   * @param options - The options parameters.
   */
  async createDataFlowDebugSession(
    request: CreateDataFlowDebugSessionRequest,
    options?: coreHttp.OperationOptions
  ): Promise<LROPoller<DataFlowDebugSessionCreateDataFlowDebugSessionResponse>> {
    const { span, updatedOptions } = createSpan(
      "ArtifactsClient-createDataFlowDebugSession",
      this.getOperationOptions(options, "undefined")
    );
    const operationArguments: coreHttp.OperationArguments = {
      request,
      options: updatedOptions
    };
    const sendOperation = async (
      args: coreHttp.OperationArguments,
      spec: coreHttp.OperationSpec
    ) => {
      try {
        const result = await this.client.sendOperationRequest(args, spec);
        return result as DataFlowDebugSessionCreateDataFlowDebugSessionResponse;
      } catch (error) {
        span.setStatus({
          code: CanonicalCode.UNKNOWN,
          message: error.message
        });
        throw error;
      } finally {
        span.end();
      }
    };

    const initialOperationResult = await sendOperation(
      operationArguments,
      createDataFlowDebugSessionOperationSpec
    );
    return new LROPoller({
      initialOperationArguments: operationArguments,
      initialOperationSpec: createDataFlowDebugSessionOperationSpec,
      initialOperationResult,
      sendOperation
    });
  }

  /**
   * Query all active data flow debug sessions.
   * @param options - The options parameters.
   */
  private async _queryDataFlowDebugSessionsByWorkspace(
    options?: coreHttp.OperationOptions
  ): Promise<DataFlowDebugSessionQueryDataFlowDebugSessionsByWorkspaceResponse> {
    const { span, updatedOptions } = createSpan(
      "ArtifactsClient-_queryDataFlowDebugSessionsByWorkspace",
      coreHttp.operationOptionsToRequestOptionsBase(options || {})
    );
    const operationArguments: coreHttp.OperationArguments = {
      options: updatedOptions
    };
    try {
      const result = await this.client.sendOperationRequest(
        operationArguments,
        queryDataFlowDebugSessionsByWorkspaceOperationSpec
      );
      return result as DataFlowDebugSessionQueryDataFlowDebugSessionsByWorkspaceResponse;
    } catch (error) {
      span.setStatus({
        code: CanonicalCode.UNKNOWN,
        message: error.message
      });
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Add a data flow into debug session.
   * @param request - Data flow debug session definition with debug content.
   * @param options - The options parameters.
   */
  async addDataFlow(
    request: DataFlowDebugPackage,
    options?: coreHttp.OperationOptions
  ): Promise<DataFlowDebugSessionAddDataFlowResponse> {
    const { span, updatedOptions } = createSpan(
      "ArtifactsClient-addDataFlow",
      coreHttp.operationOptionsToRequestOptionsBase(options || {})
    );
    const operationArguments: coreHttp.OperationArguments = {
      request,
      options: updatedOptions
    };
    try {
      const result = await this.client.sendOperationRequest(
        operationArguments,
        addDataFlowOperationSpec
      );
      return result as DataFlowDebugSessionAddDataFlowResponse;
    } catch (error) {
      span.setStatus({
        code: CanonicalCode.UNKNOWN,
        message: error.message
      });
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Deletes a data flow debug session.
   * @param request - Data flow debug session definition for deletion
   * @param options - The options parameters.
   */
  async deleteDataFlowDebugSession(
    request: DeleteDataFlowDebugSessionRequest,
    options?: coreHttp.OperationOptions
  ): Promise<coreHttp.RestResponse> {
    const { span, updatedOptions } = createSpan(
      "ArtifactsClient-deleteDataFlowDebugSession",
      coreHttp.operationOptionsToRequestOptionsBase(options || {})
    );
    const operationArguments: coreHttp.OperationArguments = {
      request,
      options: updatedOptions
    };
    try {
      const result = await this.client.sendOperationRequest(
        operationArguments,
        deleteDataFlowDebugSessionOperationSpec
      );
      return result as coreHttp.RestResponse;
    } catch (error) {
      span.setStatus({
        code: CanonicalCode.UNKNOWN,
        message: error.message
      });
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Execute a data flow debug command.
   * @param request - Data flow debug command definition.
   * @param options - The options parameters.
   */
  async executeCommand(
    request: DataFlowDebugCommandRequest,
    options?: coreHttp.OperationOptions
  ): Promise<LROPoller<DataFlowDebugSessionExecuteCommandResponse>> {
    const { span, updatedOptions } = createSpan(
      "ArtifactsClient-executeCommand",
      this.getOperationOptions(options, "undefined")
    );
    const operationArguments: coreHttp.OperationArguments = {
      request,
      options: updatedOptions
    };
    const sendOperation = async (
      args: coreHttp.OperationArguments,
      spec: coreHttp.OperationSpec
    ) => {
      try {
        const result = await this.client.sendOperationRequest(args, spec);
        return result as DataFlowDebugSessionExecuteCommandResponse;
      } catch (error) {
        span.setStatus({
          code: CanonicalCode.UNKNOWN,
          message: error.message
        });
        throw error;
      } finally {
        span.end();
      }
    };

    const initialOperationResult = await sendOperation(
      operationArguments,
      executeCommandOperationSpec
    );
    return new LROPoller({
      initialOperationArguments: operationArguments,
      initialOperationSpec: executeCommandOperationSpec,
      initialOperationResult,
      sendOperation
    });
  }

  /**
   * QueryDataFlowDebugSessionsByWorkspaceNext
   * @param nextLink - The nextLink from the previous successful call to the
   *                 QueryDataFlowDebugSessionsByWorkspace method.
   * @param options - The options parameters.
   */
  private async _queryDataFlowDebugSessionsByWorkspaceNext(
    nextLink: string,
    options?: coreHttp.OperationOptions
  ): Promise<DataFlowDebugSessionQueryDataFlowDebugSessionsByWorkspaceNextResponse> {
    const { span, updatedOptions } = createSpan(
      "ArtifactsClient-_queryDataFlowDebugSessionsByWorkspaceNext",
      coreHttp.operationOptionsToRequestOptionsBase(options || {})
    );
    const operationArguments: coreHttp.OperationArguments = {
      nextLink,
      options: updatedOptions
    };
    try {
      const result = await this.client.sendOperationRequest(
        operationArguments,
        queryDataFlowDebugSessionsByWorkspaceNextOperationSpec
      );
      return result as DataFlowDebugSessionQueryDataFlowDebugSessionsByWorkspaceNextResponse;
    } catch (error) {
      span.setStatus({
        code: CanonicalCode.UNKNOWN,
        message: error.message
      });
      throw error;
    } finally {
      span.end();
    }
  }

  private getOperationOptions<TOptions extends coreHttp.OperationOptions>(
    options: TOptions | undefined,
    finalStateVia?: string
  ): coreHttp.RequestOptionsBase {
    const operationOptions: coreHttp.OperationOptions = options || {};
    operationOptions.requestOptions = {
      ...operationOptions.requestOptions,
      shouldDeserialize: shouldDeserializeLRO(finalStateVia)
    };
    return coreHttp.operationOptionsToRequestOptionsBase(operationOptions);
  }
}
// Operation Specifications
const serializer = new coreHttp.Serializer(Mappers, /* isXml */ false);

const createDataFlowDebugSessionOperationSpec: coreHttp.OperationSpec = {
  path: "/createDataFlowDebugSession",
  httpMethod: "POST",
  responses: {
    200: {
      bodyMapper: Mappers.CreateDataFlowDebugSessionResponse
    },
    201: {
      bodyMapper: Mappers.CreateDataFlowDebugSessionResponse
    },
    202: {
      bodyMapper: Mappers.CreateDataFlowDebugSessionResponse
    },
    204: {
      bodyMapper: Mappers.CreateDataFlowDebugSessionResponse
    },
    default: {
      bodyMapper: Mappers.CloudError
    }
  },
  requestBody: Parameters.request1,
  queryParameters: [Parameters.apiVersion],
  urlParameters: [Parameters.endpoint],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const queryDataFlowDebugSessionsByWorkspaceOperationSpec: coreHttp.OperationSpec = {
  path: "/queryDataFlowDebugSessions",
  httpMethod: "POST",
  responses: {
    200: {
      bodyMapper: Mappers.QueryDataFlowDebugSessionsResponse
    },
    default: {
      bodyMapper: Mappers.CloudError
    }
  },
  queryParameters: [Parameters.apiVersion],
  urlParameters: [Parameters.endpoint],
  headerParameters: [Parameters.accept],
  serializer
};
const addDataFlowOperationSpec: coreHttp.OperationSpec = {
  path: "/addDataFlowToDebugSession",
  httpMethod: "POST",
  responses: {
    200: {
      bodyMapper: Mappers.AddDataFlowToDebugSessionResponse
    },
    default: {
      bodyMapper: Mappers.CloudError
    }
  },
  requestBody: Parameters.request2,
  queryParameters: [Parameters.apiVersion],
  urlParameters: [Parameters.endpoint],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const deleteDataFlowDebugSessionOperationSpec: coreHttp.OperationSpec = {
  path: "/deleteDataFlowDebugSession",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.CloudError
    }
  },
  requestBody: Parameters.request3,
  queryParameters: [Parameters.apiVersion],
  urlParameters: [Parameters.endpoint],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const executeCommandOperationSpec: coreHttp.OperationSpec = {
  path: "/executeDataFlowDebugCommand",
  httpMethod: "POST",
  responses: {
    200: {
      bodyMapper: Mappers.DataFlowDebugCommandResponse
    },
    201: {
      bodyMapper: Mappers.DataFlowDebugCommandResponse
    },
    202: {
      bodyMapper: Mappers.DataFlowDebugCommandResponse
    },
    204: {
      bodyMapper: Mappers.DataFlowDebugCommandResponse
    },
    default: {
      bodyMapper: Mappers.CloudError
    }
  },
  requestBody: Parameters.request4,
  queryParameters: [Parameters.apiVersion],
  urlParameters: [Parameters.endpoint],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const queryDataFlowDebugSessionsByWorkspaceNextOperationSpec: coreHttp.OperationSpec = {
  path: "{nextLink}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.QueryDataFlowDebugSessionsResponse
    },
    default: {
      bodyMapper: Mappers.CloudError
    }
  },
  queryParameters: [Parameters.apiVersion],
  urlParameters: [Parameters.endpoint, Parameters.nextLink],
  headerParameters: [Parameters.accept],
  serializer
};
