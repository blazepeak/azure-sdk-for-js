// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { BlobChangeFeedEvent } from "./models/BlobChangeFeedEvent";
import { Shard } from "./Shard";
import { SegmentCursor, ShardCursor } from "./models/ChangeFeedCursor";
import { CommonOptions } from "@azure/storage-blob";
import { AbortSignalLike } from "@azure/core-http";
import { createSpan } from "./utils/tracing";
import { CanonicalCode } from "@opentelemetry/api";

/**
 * Options to configure {@link Segment.getChange} operation.
 *
 * @export
 * @interface SegmentGetChangeOptions
 */
export interface SegmentGetChangeOptions extends CommonOptions {
  /**
   * An implementation of the `AbortSignalLike` interface to signal the request to cancel the operation.
   * For example, use the &commat;azure/abort-controller to create an `AbortSignal`.
   *
   * @type {AbortSignalLike}
   * @memberof SegmentGetChangeOptions
   */
  abortSignal?: AbortSignalLike;
}

export class Segment {
  private readonly shards: Shard[];

  // Track shards that we have finished reading from.
  private shardDone: boolean[];
  private shardDoneCount: number;

  private shardIndex: number;

  // Assuming the dateTime of segments is rounded to hour. If not, our logic for fetching
  // change events between a time range would be incorrect.
  private _dateTime: Date;
  public get dateTime(): Date {
    return this._dateTime;
  }

  constructor(
    shards: Shard[],
    shardIndex: number,
    dateTime: Date,
    private readonly manifestPath: string
  ) {
    this.shards = shards;
    this.shardIndex = shardIndex;
    this._dateTime = dateTime;

    // TODO: add polyfill for Array.prototype.fill for IE11
    this.shardDone = Array(shards.length).fill(false);
    this.shardDoneCount = 0;
  }

  public hasNext(): boolean {
    return this.shards.length > this.shardDoneCount;
  }

  public async getChange(
    options: SegmentGetChangeOptions = {}
  ): Promise<BlobChangeFeedEvent | undefined> {
    const { span, spanOptions } = createSpan("Segment-getChange", options.tracingOptions);

    try {
      if (this.shardIndex >= this.shards.length || this.shardIndex < 0) {
        throw new Error("shardIndex invalid.");
      }

      let event: BlobChangeFeedEvent | undefined = undefined;
      while (event === undefined && this.hasNext()) {
        if (this.shardDone[this.shardIndex]) {
          this.shardIndex = (this.shardIndex + 1) % this.shards.length; // find next available shard
          continue;
        }

        const currentShard = this.shards[this.shardIndex];
        event = await currentShard.getChange({
          abortSignal: options.abortSignal,
          tracingOptions: { ...options.tracingOptions, spanOptions }
        });

        if (!currentShard.hasNext()) {
          this.shardDone[this.shardIndex] = true;
          this.shardDoneCount++;
        }
        // Round robin with shards
        this.shardIndex = (this.shardIndex + 1) % this.shards.length;
      }
      return event;
    } catch (e) {
      span.setStatus({
        code: CanonicalCode.UNKNOWN,
        message: e.message
      });
      throw e;
    } finally {
      span.end();
    }
  }

  public getCursor(): SegmentCursor {
    const shardCursors: ShardCursor[] = [];
    for (const shard of this.shards) {
      const shardCursor = shard.getCursor();
      if (shardCursor) {
        shardCursors.push(shardCursor);
      }
    }

    return {
      SegmentPath: this.manifestPath,
      ShardCursors: shardCursors,
      CurrentShardPath: this.shards[this.shardIndex].shardPath
    };
  }
}
