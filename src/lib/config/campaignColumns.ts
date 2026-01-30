export interface CampaignColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  order: number;
}

export const DEFAULT_CAMPAIGN_COLUMNS: CampaignColumnConfig[] = [
  { key: "full_name", label: "Name", visible: true, order: 1 },
  { key: "company", label: "Company", visible: true, order: 2 },
  { key: "email", label: "Email", visible: true, order: 3 },
  { key: "phone", label: "Phone", visible: true, order: 4 },
  { key: "status", label: "Status", visible: true, order: 5 },
  { key: "next_follow_up_at", label: "Follow-up", visible: true, order: 6 },
  { key: "updated_at", label: "Updated", visible: true, order: 7 },
];

export function getDefaultCampaignColumns(): CampaignColumnConfig[] {
  return DEFAULT_CAMPAIGN_COLUMNS.map((col) => ({ ...col }));
}

