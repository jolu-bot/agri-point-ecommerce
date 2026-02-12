import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Campaign } from '@/models/Campaign';
import Order from '@/models/Order';

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const { campaignId, ...eligibilityData } = body;

    // Vérifier la campagne existe
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campagne non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier l'éligibilité
    const eligibilityIssues: string[] = [];

    if (campaign.eligibility.requireCooperativeMembership && !eligibilityData.isMember) {
      eligibilityIssues.push('Adhésion coopérative requise');
    }

    if (campaign.eligibility.requireMutualInsurance && !eligibilityData.hasInsurance) {
      eligibilityIssues.push('Assurance mutuelle requise');
    }

    if (eligibilityData.quantity < campaign.eligibility.minQuantity) {
      eligibilityIssues.push(`Quantité minimale: ${campaign.eligibility.minQuantity}`);
    }

    const isEligible = eligibilityIssues.length === 0;

    // Sauvegarder les données d'éligibilité en session ou base de données
    // Pour ce prototype, on retourne l'état d'éligibilité
    return NextResponse.json({
      success: true,
      eligible: isEligible,
      message: isEligible ? 'Éligibilité confirmée' : 'Non éligible',
      issues: eligibilityIssues,
      campaignData: {
        id: campaign._id,
        slug: campaign.slug,
        paymentScheme: campaign.paymentScheme,
        eligibility: {
          isEligible,
          cooperativeMember: eligibilityData.isMember,
          mutualInsuranceValid: eligibilityData.hasInsurance,
          insuranceProvider: eligibilityData.insuranceProvider,
          cooperativeEmail: eligibilityData.cooperativeEmail,
        },
      },
    });
  } catch (error) {
    console.error('Erreur lors de la vérification d\'éligibilité:', error);
    return NextResponse.json(
      { error: 'Erreur du serveur' },
      { status: 500 }
    );
  }
}
