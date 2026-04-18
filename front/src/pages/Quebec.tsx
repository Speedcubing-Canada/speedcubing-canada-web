import { ProvinceRedirect } from "../components/ProvinceRedirect";
import { LINKS } from "./links";

export const Quebec = () => {
  return (
    <ProvinceRedirect
      province="qc"
      redirectUrl={LINKS.DISCORD_QC}
      linkTitle="Discord"
    />
  );
};
