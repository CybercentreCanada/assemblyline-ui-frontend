import { useTableOfContent } from 'components/core/TableOfContent/TableOfContent';
import useALContext from 'components/hooks/useALContext';
import { useForm } from 'components/routes/settings/settings.form';
import { PageNavigation, PageNavigationItem } from 'components/visual/Layouts/PageNavigation';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export const RightNav = React.memo(() => {
  const { t } = useTranslation(['settings']);
  const form = useForm();
  const { settings } = useALContext();
  const { ActiveAnchor, scrollTo } = useTableOfContent();

  const handleCategoryChange = useCallback(
    (selected: boolean, cat_id: number) => {
      form.setFieldValue('settings', s => {
        if (selected) {
          s.services[cat_id].selected = false;
          s.services[cat_id].services.forEach((svr, i) => {
            s.services[cat_id].services[i].selected = false;
          });
        } else {
          s.services[cat_id].selected = true;
          s.services[cat_id].services.forEach((svr, i) => {
            s.services[cat_id].services[i].selected = true;
          });
        }

        return s;
      });
    },
    [form]
  );

  const handleServiceChange = useCallback(
    (selected: boolean, cat_id: number, svr_id: number) => {
      form.setFieldValue('settings', s => {
        if (selected) {
          s.services[cat_id].selected = false;
          s.services[cat_id].services[svr_id].selected = false;
        } else {
          s.services[cat_id].services[svr_id].selected = true;
          s.services[cat_id].selected = s.services[cat_id].services.every(srv => srv.selected);
        }
        return s;
      });
    },
    [form]
  );

  return (
    <form.Subscribe
      selector={state =>
        [
          state.values.state.loading || !(state.values.state.tab in (settings?.submission_profiles || {})),
          state.values.state.disabled,
          state.values.state.customize
        ] as const
      }
    >
      {([preventRender, disabled, customize]) => (
        <PageNavigation preventRender={preventRender} variant="right">
          {/* Submissions */}
          <ActiveAnchor activeID="submissions">
            {active => (
              <PageNavigationItem
                primary={t('submissions')}
                variant="right"
                active={active}
                subheader
                onPageNavigation={event => scrollTo(event, 'submissions')}
              />
            )}
          </ActiveAnchor>

          {/* Services main section */}
          <ActiveAnchor activeID="services">
            {active => (
              <PageNavigationItem
                primary={t('services')}
                variant="right"
                active={active}
                subheader
                onPageNavigation={event => scrollTo(event, 'services')}
              />
            )}
          </ActiveAnchor>

          {/* Service categories and services */}
          <form.Subscribe selector={state => [state.values.settings.services] as const}>
            {([categories]) =>
              categories.map((category, cat_id) => (
                <div key={cat_id} style={{ display: 'contents' }}>
                  <ActiveAnchor activeID={category.name}>
                    {active => (
                      <form.Subscribe
                        selector={state => {
                          const selected = state.values.settings.services[cat_id]?.selected ?? false;
                          const list = state.values.settings.services[cat_id]?.services.map(s => s.selected) ?? [];
                          return [selected, !list.every(i => i) && list.some(i => i)];
                        }}
                      >
                        {([checked, indeterminate]) => (
                          <PageNavigationItem
                            id={category.name}
                            primary={category.name}
                            variant="right"
                            active={active}
                            subheader
                            onPageNavigation={event => scrollTo(event, category.name)}
                            checkboxProps={{
                              checked,
                              indeterminate,
                              disabled: disabled || (!customize && category.restricted),
                              onChange: () => handleCategoryChange(checked, cat_id)
                            }}
                          />
                        )}
                      </form.Subscribe>
                    )}
                  </ActiveAnchor>

                  {/* Individual services */}
                  <form.Subscribe selector={state => [state.values?.settings.services[cat_id]?.services] as const}>
                    {([services]) =>
                      services.map((service, svr_id) => (
                        <ActiveAnchor key={`${cat_id}-${svr_id}`} activeID={`${service.category}-${service.name}`}>
                          {active => (
                            <form.Subscribe
                              selector={state => [
                                state.values.settings.services[cat_id]?.services[svr_id]?.selected ?? false
                              ]}
                            >
                              {([checked]) => (
                                <PageNavigationItem
                                  id={`${service.category}-${service.name}`}
                                  primary={service.name}
                                  variant="right"
                                  active={active}
                                  onPageNavigation={event => scrollTo(event, `${service.category}-${service.name}`)}
                                  checkboxProps={{
                                    checked,
                                    disabled: disabled || (!customize && category.restricted),
                                    onChange: () => handleServiceChange(checked, cat_id, svr_id)
                                  }}
                                />
                              )}
                            </form.Subscribe>
                          )}
                        </ActiveAnchor>
                      ))
                    }
                  </form.Subscribe>
                </div>
              ))
            }
          </form.Subscribe>
        </PageNavigation>
      )}
    </form.Subscribe>
  );
});

RightNav.displayName = 'RightNav';
