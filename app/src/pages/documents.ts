export const DOCUMENT_TYPES = [
  "byLaws",
  "minutes",
  "policies",
  "corporate",
] as const;

export const DOCUMENTS = {
  byLaws: [
    { name: "By-laws", id: "by-laws" },
    { name: "By-laws (v1.0)", id: "by-laws-v1.0" },
    { name: "By-laws (v1.1)", id: "by-laws-v1.1" },
    { name: "By-laws (v1.2)", id: "by-laws-v1.2" },
    { name: "By-laws (v1.3)", id: "by-laws-v1.3" },
    { name: "By-laws (v1.4)", id: "by-laws-v1.4" },
  ],
  minutes: [
    {
      name: "Directors' Meeting July 20, 2023",
      id: "directors-meeting-jul-20-2023",
    },
    {
      name: "Directors' Meeting May 16, 2023",
      id: "directors-meeting-may-16-2023",
    },
    {
      name: "Directors' Meeting April 19, 2023",
      id: "directors-meeting-apr-19-2023",
    },
    {
      name: "Annual Members' Meeting January 29, 2023",
      id: "annual-members-meeting-jan-29-2023",
    },
    {
      name: "Directors' Meeting August 12, 2022",
      id: "directors-meeting-aug-12-2022",
    },
    {
      name: "Directors' Meeting May 25, 2022",
      id: "directors-meeting-may-25-2022",
    },
    {
      name: "First Members' Meeting May 7, 2022",
      id: "first-members-meeting-may-7-2022",
    },
    {
      name: "Directors' Meeting April 9, 2022",
      id: "directors-meeting-apr-9-2022",
    },
    {
      name: "First Directors' Meeting February 26, 2022",
      id: "first-directors-meeting-feb-26-2022",
    },
  ],
  policies: [
    {
      name: "Speedcubing Canada Reimbursement Policy",
      id: "reimbursement-policy",
    },
    {
      name: "Speedcubing Canada Supported Events Policy",
      id: "supported-events-policy",
    },
    {
      name: "Speedcubing Canada Major Championship Reimbursement Transfer Policy",
      id: "major-championship-reimbursement-transfer-policy",
    },
    {
      name: "Speedcubing Canada Reimbursement Policy (v1.0)",
      id: "reimbursement-policy-v1.0",
    },
    {
      name: "Speedcubing Canada Reimbursement Policy (v1.1)",
      id: "reimbursement-policy-v1.1",
    },
    {
      name: "Speedcubing Canada Reimbursement Policy (v1.2)",
      id: "reimbursement-policy-v1.2",
    },
    {
      name: "Speedcubing Canada Supported Events Policy (v1.0)",
      id: "supported-events-policy-v1.0",
    },
    {
      name: "Speedcubing Canada Supported Events Policy (v1.1)",
      id: "supported-events-policy-v1.1",
    },
    {
      name: "Speedcubing Canada Major Championship Reimbursement Transfer Policy (v1.0)",
      id: "major-championship-reimbursement-transfer-policy",
    },
  ],
  corporate: [
    {
      name: "Certificate of Incorporation",
      id: "certificate-of-incorporation",
    },
  ],
} as const;
