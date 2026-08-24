import { FormProvider } from 'components/routes/submit/submit.form';
import { SubmitRoute } from 'components/routes/submit/submit.route';

const SubmitPage = () => (
  <FormProvider>
    <SubmitRoute />
  </FormProvider>
);

export default SubmitPage;
