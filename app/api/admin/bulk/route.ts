import { NextRequest, NextResponse } from 'next/server';
import { executeBulkOperation } from '@/lib/bulk-operations';
import { validateInput, BulkOperationSchema } from '@/lib/validation-schemas';
import Product from '@/models/Product';
import Page from '@/models/Page';
import Order from '@/models/Order';
import { getLogger } from '@/lib/logger-rotation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const adminId = request.headers.get('x-admin-id');

    if (!adminId) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    // Valider l'input
    const validated = await validateInput(BulkOperationSchema, body);
    const { ids, action, status, metadata } = validated;

    // Déterminer le model par la route
    const resourceType = request.headers.get('x-resource-type') || 'products';
    let Model;

    switch (resourceType) {
      case 'products':
        Model = Product;
        break;
      case 'pages':
        Model = Page;
        break;
      case 'orders':
        Model = Order;
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid resource type' },
          { status: 400 }
        );
    }

    // Exécuter l'opération bulk
    const result = await executeBulkOperation(
      action,
      Model,
      ids,
      metadata
    );

    // LOG AUDIT
    getLogger().info(
      {
        adminId,
        resourceType,
        action,
        count: ids.length,
        success: result.success,
        failed: result.failed,
        duration: result.totalTime,
        timestamp: new Date(),
      },
      'BULK_OPERATION_EXECUTED'
    );

    return NextResponse.json({
      success: result.failed === 0,
      result,
      message: `Bulk operation completed: ${result.success} succeeded, ${result.failed} failed`,
    });
  } catch (error) {
    getLogger().error(
      { error: error instanceof Error ? error.message : error },
      'BULK_OPERATION_ERROR'
    );

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Bulk operation failed',
      },
      { status: 500 }
    );
  }
}

// GET - Get bulk operation history
export async function GET(request: NextRequest) {
  try {
    const adminId = request.headers.get('x-admin-id');
    if (!adminId) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    // À implémenter: récupérer l'historique des opérations bulk
    // const history = await BulkOperationLog.find({ adminId }).limit(50);

    return NextResponse.json({
      success: true,
      operations: [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve operations' },
      { status: 500 }
    );
  }
}
