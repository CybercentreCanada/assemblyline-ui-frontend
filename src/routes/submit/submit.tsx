import { FormProvider } from 'routes/submit/submit.form.ts';
import { SubmitRoute } from 'routes/submit/submit.route.tsx';

const SubmitPage = () => (
  <FormProvider>
    <SubmitRoute />
  </FormProvider>
);

export default SubmitPage;
