import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { useTableOfContent } from 'components/core/TableOfContent/TableOfContent';
import type { SettingsStore } from 'components/routes/settings/contexts/form';
import { useForm } from 'components/routes/settings/contexts/form';
import { PageNavigation, PageNavigationItem } from 'components/visual/Layouts/PageNavigation';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export const RightNav = () => {
  const { t } = useTranslation(['settings']);
  const form = useForm();
  const { ActiveAnchor, scrollTo } = useTableOfContent();

  const handleCategoryChange = useCallback(
    (selected: boolean, profile: SettingsStore['state']['tab'], cat_id: number) => {
      form.setStore(s => {
        if (selected) {
          s.next.profiles[profile].services[cat_id].selected = false;
          s.next.profiles[profile].services[cat_id].services.forEach((svr, i) => {
            s.next.profiles[profile].services[cat_id].services[i].selected = false;
          });
        } else {
          s.next.profiles[profile].services[cat_id].selected = true;
          s.next.profiles[profile].services[cat_id].services.forEach((svr, i) => {
            s.next.profiles[profile].services[cat_id].services[i].selected = true;
          });
        }

        return s;
      });
    },
    [form]
  );

  const handleServiceChange = useCallback(
    (selected: boolean, profile: SettingsStore['state']['tab'], cat_id: number, svr_id: number) => {
      form.setStore(s => {
        if (selected) {
          s.next.profiles[profile].services[cat_id].selected = false;
          s.next.profiles[profile].services[cat_id].services[svr_id].selected = false;
        } else {
          s.next.profiles[profile].services[cat_id].services[svr_id].selected = true;
          s.next.profiles[profile].services[cat_id].selected = s.next.profiles[profile].services[cat_id].services.every(
            srv => srv.selected
          );
        }
        return s;
      });
    },
    [form]
  );
  return (
    <form.Subscribe
      selector={state => [
        state.values.state.tab,
        state.values.state.loading,
        state.values.state.disabled,
        state.values.state.customize
      ]}
      children={props => {
        const profile = props[0] as SettingsStore['state']['tab'];
        const loading = props[1] as boolean;
        const disabled = props[2] as boolean;
        const customize = props[3] as boolean;

        return (
          <PageNavigation subheader={t('content')} preventRender={loading || profile === 'interface'} variant="right">
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
              selector={state => state.values?.next?.profiles?.[profile]?.services || []}
              children={categories =>
                categories.map((category, cat_id) => (
                  <div key={cat_id} style={{ display: 'contents' }}>
                    <ActiveAnchor
                      key={cat_id}
                      activeID={category.name}
                      children={active => (
                        <form.Subscribe
                          selector={state => {
                            const selected = state.values.next.profiles[profile].services[cat_id].selected;
                            const list = state.values.next.profiles[profile].services[cat_id].services.map(
                              svr => svr.selected
                            );
                            return [selected, !list.every(i => i) && list.some(i => i)];
                          }}
                          children={categoryProps => (
                            <PageNavigationItem
                              primary={category.name}
                              variant="right"
                              active={active}
                              preventRender={!customize && !(categoryProps[0] || categoryProps[1])}
                              subheader
                              sx={categoryProps[0] || categoryProps[1] ? null : { opacity: 0.38 }}
                              onPageNavigation={event => scrollTo(event, category.name)}
                              checkboxProps={{
                                checked: categoryProps[0],
                                indeterminate: categoryProps[1],
                                disabled: disabled || !customize,
                                onChange: () => handleCategoryChange(categoryProps[0], profile, cat_id)
                              }}
                            />
                          )}
                        />
                      )}
                    />
                    <form.Subscribe
                      selector={state => state.values?.next?.profiles?.[profile]?.services?.[cat_id]?.services || []}
                      children={services =>
                        services.map((service, svr_id) => (
                          <ActiveAnchor
                            key={`${cat_id}-${svr_id}`}
                            activeID={`${service.category}-${service.name}`}
                            children={active => (
                              <form.Subscribe
                                selector={state => [
                                  state.values.next.profiles[profile].services[cat_id].services[svr_id].selected,
                                  state.values.next.profiles[profile].service_spec.some(
                                    spec => spec.name === service.name
                                  )
                                ]}
                                children={serviceProps => (
                                  <PageNavigationItem
                                    primary={
                                      <div style={{ display: 'flex' }}>
                                        <span>{service.name}</span>
                                        {serviceProps[1] && <ArrowRightIcon style={{ height: '20px' }} />}
                                      </div>
                                    }
                                    variant="right"
                                    active={active}
                                    preventRender={!customize && !serviceProps[0]}
                                    sx={serviceProps[0] ? null : { opacity: 0.38 }}
                                    onPageNavigation={event => scrollTo(event, `${service.category}-${service.name}`)}
                                    checkboxProps={{
                                      checked: serviceProps[0],
                                      disabled: disabled || !customize,
                                      onChange: () => handleServiceChange(serviceProps[0], profile, cat_id, svr_id)
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
        );
      }}
    />
  );
};
