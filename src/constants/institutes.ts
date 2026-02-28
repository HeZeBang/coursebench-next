export interface InstituteInfo {
  name: string;
  color: string;
}

export const instituteInfo: Record<string, InstituteInfo> = {
  信息科学与技术学院: { name: "SIST", color: "#b0c4de" },
  物质科学与技术学院: { name: "SPST", color: "#00a650" },
  生命科学与技术学院: { name: "SLST", color: "#f39800" },
  创意与艺术学院: { name: "SCA", color: "#000000" },
  创业与管理学院: { name: "SEM", color: "#7d3c92" },
  人文科学研究院: { name: "IH", color: "#a40050" },
  生物医学工程学院: { name: "BME", color: "#101f5b" },
  数学科学研究所: { name: "IMS", color: "#2800ae" },
  其他学院: { name: "Other", color: "#757575" },
  "": { name: "None", color: "#B0B0B0" },
};

export function getInstituteColor(institute: string): string {
  return instituteInfo[institute]?.color ?? "#757575";
}

export function getInstituteAbbr(institute: string): string {
  return instituteInfo[institute]?.name ?? "Other";
}

export const instituteNames = Object.keys(instituteInfo).filter(Boolean);
