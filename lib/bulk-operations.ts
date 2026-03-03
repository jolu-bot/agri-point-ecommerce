import { Types } from 'mongoose';

export interface BulkOperationResult {
  success: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
  totalTime: number;
}

/**
 * Bulk delete operation
 */
export async function bulkDelete(
  Model: any,
  ids: string[]
): Promise<BulkOperationResult> {
  const startTime = Date.now();
  const result: BulkOperationResult = {
    success: 0,
    failed: 0,
    errors: [],
    totalTime: 0,
  };

  try {
    const objectIds = ids.map(id => new Types.ObjectId(id));

    const deleteResult = await Model.deleteMany({
      _id: { $in: objectIds },
    });

    result.success = deleteResult.deletedCount || 0;
    result.failed = ids.length - result.success;
  } catch (error) {
    result.failed = ids.length;
    result.errors.push({
      id: 'bulk_operation',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  result.totalTime = Date.now() - startTime;
  return result;
}

/**
 * Bulk update operation
 */
export async function bulkUpdate(
  Model: any,
  ids: string[],
  updateData: Record<string, any>
): Promise<BulkOperationResult> {
  const startTime = Date.now();
  const result: BulkOperationResult = {
    success: 0,
    failed: 0,
    errors: [],
    totalTime: 0,
  };

  try {
    const objectIds = ids.map(id => new Types.ObjectId(id));

    const updateResult = await Model.updateMany(
      { _id: { $in: objectIds } },
      { $set: updateData },
      { new: true }
    );

    result.success = updateResult.modifiedCount || 0;
    result.failed = ids.length - result.success;
  } catch (error) {
    result.failed = ids.length;
    result.errors.push({
      id: 'bulk_operation',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  result.totalTime = Date.now() - startTime;
  return result;
}

/**
 * Bulk archive operation
 */
export async function bulkArchive(
  Model: any,
  ids: string[]
): Promise<BulkOperationResult> {
  return bulkUpdate(Model, ids, {
    isArchived: true,
    archivedAt: new Date(),
  });
}

/**
 * Bulk publish operation (pour contenu)
 */
export async function bulkPublish(
  Model: any,
  ids: string[]
): Promise<BulkOperationResult> {
  return bulkUpdate(Model, ids, {
    isPublished: true,
    publishedAt: new Date(),
  });
}

/**
 * Bulk unpublish operation
 */
export async function bulkUnpublish(
  Model: any,
  ids: string[]
): Promise<BulkOperationResult> {
  return bulkUpdate(Model, ids, {
    isPublished: false,
    publishedAt: null,
  });
}

/**
 * Helper function pour exécuter bulk operations avec validation
 */
export async function executeBulkOperation(
  operationType: string,
  Model: any,
  ids: string[],
  updateData?: Record<string, any>
): Promise<BulkOperationResult> {
  if (ids.length === 0) {
    return { success: 0, failed: 0, errors: [{ id: 'validation', error: 'No IDs provided' }], totalTime: 0 };
  }

  if (ids.length > 1000) {
    return { success: 0, failed: 0, errors: [{ id: 'validation', error: 'Maximum 1000 items per operation' }], totalTime: 0 };
  }

  switch (operationType) {
    case 'delete':
      return bulkDelete(Model, ids);
    case 'archive':
      return bulkArchive(Model, ids);
    case 'publish':
      return bulkPublish(Model, ids);
    case 'unpublish':
      return bulkUnpublish(Model, ids);
    default:
      if (updateData) {
        return bulkUpdate(Model, ids, updateData);
      }
      return { success: 0, failed: 0, errors: [{ id: 'validation', error: 'Unknown operation' }], totalTime: 0 };
  }
}
