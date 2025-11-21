import { useTableOfContent } from 'components/core/TableOfContent/TableOfContent';
import useALContext from 'components/hooks/useALContext';
import { useForm } from 'components/routes/settings/settings.form';
import { PageNavigation, PageNavigationItem } from 'components/visual/Layouts/PageNavigation';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const RightNav = React.memo(() => {
  const { t } = useTranslation(['settings']);
  const form = useForm();
  const { configuration, settings } = useALContext();
  const { ActiveAnchor, scrollTo } = useTableOfContent();

  const fileSources = useMemo<string[]>(() => {
    const sourcesObj = configuration?.submission?.file_sources;
    if (!sourcesObj) return [];

    const sourcesSet = new Set<string>();
    Object.values(sourcesObj).forEach(file => {
      file?.sources?.forEach(src => {
        if (src) sourcesSet.add(src);
      });
    });

    return Array.from(sourcesSet).sort();
  }, [configuration]);

  const handleCategoryChange = useCallback(
    (selected: boolean, cat_id: number) => {
      form.setFieldValue('settings', s => {
        const category = s.services[cat_id];
        if (!category) return s;

        return {
          ...s,
          services: s.services.map((cat, idx) =>
            idx !== cat_id
              ? cat
              : { ...cat, selected: !selected, services: cat.services.map(svr => ({ ...svr, selected: !selected })) }
          )
        };
      });
    },
    [form]
  );

  const handleServiceChange = useCallback(
    (selected: boolean, cat_id: number, svr_id: number) => {
      form.setFieldValue('settings', s => {
        const category = s.services[cat_id];
        if (!category) return s;

        const services = category.services.map((svr, idx) => (idx === svr_id ? { ...svr, selected: !selected } : svr));
        const categorySelected = services.every(s => s.selected);

        return {
          ...s,
          services: s.services.map((cat, idx) =>
            idx === cat_id ? { ...cat, selected: categorySelected, services } : cat
          )
        };
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

          {/* Default external sources */}
          {fileSources.length > 0 && (
            <ActiveAnchor activeID="default_external_sources">
              {active => (
                <PageNavigationItem
                  primary={t('submissions.default_external_sources')}
                  variant="right"
                  active={active}
                  subheader
                  onPageNavigation={event => scrollTo(event, 'default_external_sources')}
                />
              )}
            </ActiveAnchor>
          )}

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
                                state.values.settings.services[cat_id]?.services[svr_id]?.selected ?? false,
                                state.values.settings.service_spec.some(spec => spec.name === service.name)
                              ]}
                            >
                              {([checked, hasSpec]) => (
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
