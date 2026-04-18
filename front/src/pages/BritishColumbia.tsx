import { ProvinceRedirect } from "../components/ProvinceRedirect";
import { LINKS } from "./links";

export const BritishColumbia = () => {
  return (
    <ProvinceRedirect
      province="bc"
      redirectUrl={LINKS.GOOGLE_DOC_BC}
      linkTitle="Google Doc"
    />
  );
};
