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

  const fileSources = useMemo<string[]>(
    () =>
      Object.values(configuration?.submission?.file_sources || {})
        .flatMap(file => file?.sources)
        .filter((value, index, array) => value && array.indexOf(value) === index)
        .sort(),
    [configuration]
  );

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
          state.values.state.loading || !(state.values.state.tab in settings.submission_profiles),
          state.values.state.disabled,
          state.values.state.customize
        ] as const
      }
      children={([preventRender, disabled, customize]) => (
        <PageNavigation preventRender={preventRender} variant="right">
          <ActiveAnchor
            activeID="submissions"
            children={active => (
              <PageNavigationItem
                primary={t('submissions')}
                variant="right"
                active={active}
                subheader
                onPageNavigation={event => scrollTo(event, 'submissions')}
              />
            )}
          />
          {fileSources.length === 0 ? null : (
            <ActiveAnchor
              activeID="default_external_sources"
              children={active => (
                <PageNavigationItem
                  primary={t('submissions.default_external_sources')}
                  variant="right"
                  active={active}
                  subheader
                  onPageNavigation={event => scrollTo(event, 'default_external_sources')}
                />
              )}
            />
          )}
          <ActiveAnchor
            activeID="services"
            children={active => (
              <PageNavigationItem
                primary={t('services')}
                variant="right"
                active={active}
                subheader
                onPageNavigation={event => scrollTo(event, 'services')}
              />
            )}
          />

          <form.Subscribe
            selector={state => [state.values.settings.services] as const}
            children={([categories]) =>
              categories.map((category, cat_id) => (
                <div key={cat_id} style={{ display: 'contents' }}>
                  <ActiveAnchor
                    activeID={category.name}
                    children={active => (
                      <form.Subscribe
                        selector={state => {
                          const selected = state.values.settings.services[cat_id].selected;
                          const list = state.values.settings.services[cat_id].services.map(svr => svr.selected);
                          return [selected, !list.every(i => i) && list.some(i => i)];
                        }}
                        children={categoryProps => (
                          <PageNavigationItem
                            id={`${category.name}`}
                            primary={category.name}
                            variant="right"
                            active={active}
                            subheader
                            onPageNavigation={event => scrollTo(event, category.name)}
                            checkboxProps={{
                              checked: categoryProps[0],
                              indeterminate: categoryProps[1],
                              disabled: disabled || !(customize || category.editable),
                              onChange: () => handleCategoryChange(categoryProps[0], cat_id)
                            }}
                          />
                        )}
                      />
                    )}
                  />
                  <form.Subscribe
                    selector={state => [state.values?.settings.services[cat_id].services] as const}
                    children={([services]) =>
                      services.map((service, svr_id) => (
                        <ActiveAnchor
                          key={`${cat_id}-${svr_id}`}
                          activeID={`${service.category}-${service.name}`}
                          children={active => (
                            <form.Subscribe
                              selector={state => [
                                state.values.settings.services[cat_id].services[svr_id].selected,
                                state.values.settings.service_spec.some(spec => spec.name === service.name)
                              ]}
                              children={serviceProps => (
                                <PageNavigationItem
                                  id={`${service.category}-${service.name}`}
                                  primary={service.name}
                                  variant="right"
                                  active={active}
                                  onPageNavigation={event => scrollTo(event, `${service.category}-${service.name}`)}
                                  checkboxProps={{
                                    checked: serviceProps[0],
                                    disabled: disabled || !(customize || category.editable),
                                    onChange: () => handleServiceChange(serviceProps[0], cat_id, svr_id)
                                  }}
                                />
                              )}
                            />
                          )}
                        />
                      ))
                    }
                  />
                </div>
              ))
            }
          />
        </PageNavigation>
      )}
    />
  );
});
