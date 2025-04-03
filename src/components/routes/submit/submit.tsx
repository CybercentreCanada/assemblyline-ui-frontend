import { FormProvider } from './submit.form';
import { SubmitRoute } from './submit.route';

const SubmitPage = () => (
  <FormProvider>
    <SubmitRoute />
  </FormProvider>
);

export default SubmitPage;
