import { prisma } from "@/libs/db";
import { escapeTelegramHtml, sendTelegramMessage } from "@/libs/telegram";

type DonationTelegramData = {
  id: number;
  campaignId: number;
  isAnonymous: boolean;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  createdAt: Date;
};

function getDonorDisplayName(donation: DonationTelegramData) {
  if (donation.isAnonymous) return "Anonimo";

  const fullName = [donation.firstName, donation.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || "Sin nombre";
}

export async function notifyNewDonation(donation: DonationTelegramData) {
  const campaign = await prisma.donationCampaign.findUnique({
    where: { id: donation.campaignId },
    select: {
      institutionName: true,
      locality: true,
    },
  });

  const campaignName = campaign
    ? `${campaign.institutionName} - ${campaign.locality}`
    : `Campana #${donation.campaignId}`;
  const donorName = getDonorDisplayName(donation);
  const email = donation.email?.trim() || "Sin email";

  const result = await sendTelegramMessage(
    `
<b>Nueva donación recibida</b>

Campaña: ${escapeTelegramHtml(campaignName)}
Donante: ${escapeTelegramHtml(donorName)}
Email: ${escapeTelegramHtml(email)}
Fecha: ${escapeTelegramHtml(donation.createdAt.toLocaleString("es-AR"))}
    `.trim(),
  );

  if (!result.success) {
    console.error(
      "No se pudo enviar la notificacion de Telegram:",
      result.error,
    );
  }
}
