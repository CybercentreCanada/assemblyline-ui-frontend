import { makeStyles } from '@mui/styles';
import type { FormApi, Validator } from '@tanstack/react-form';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import type { UserSettings } from 'components/models/base/user_settings';
import { DEFAULT_SETTINGS } from 'components/routes/submit/mock/settings';
import _ from 'lodash';
import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { ExternalSourcesSection } from './components/ExternalSources';
import { HeaderSection } from './components/Header';
import { InterfaceSection } from './components/Interface';
import { Navigation } from './components/Navigation';
import { ServicesSection } from './components/Services';
import { SubmissionSection } from './components/Submission';
import { Tab } from './components/Tab';
import type { SettingsStore } from './contexts/form';
import { FormProvider, useForm } from './contexts/form';
import { decompressSubmissionProfiles } from './utils/utils';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    // maxHeight: 'calc(100vh-64px)',
    overflowY: 'auto'
  },
  wrapper: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    height: 'fit-content'
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    margin: `0 ${theme.spacing(4)}`,
    width: '100%',
    minWidth: `${theme.breakpoints.values.md}px`,
    maxWidth: '1200px'
  },
  navigation: {
    position: 'sticky',
    top: '0px',
    overflowX: 'hidden',
    overflowY: 'scroll',
    scrollbarWidth: 'none',
    minWidth: 'fit-content'
  },
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    backgroundColor: theme.palette.background.default
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: theme.spacing(4),
    marginTop: theme.spacing(4)
  }
}));

type Params = {
  tab: SettingsStore['state']['tab'];
};

const SettingsContent = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const { tab: tabParam } = useParams<Params>();
  const { user: currentUser } = useALContext();

  const form = useForm();

  const rootRef = useRef<HTMLDivElement>();
  const headerRef = useRef<HTMLDivElement>();

  const handleScroll = useCallback((event: React.SyntheticEvent, anchorID: string) => {
    event.preventDefault();
    event.stopPropagation();
    const element: HTMLDivElement = rootRef.current.querySelector("[data-anchor='" + anchorID + "']");
    rootRef.current.scrollTo({
      top: element.offsetTop - rootRef.current.offsetTop - headerRef.current.getBoundingClientRect().height,
      behavior: 'smooth'
    });
  }, []);

  const isElementInViewport = useCallback((element: Element) => {
    const rect = element.getBoundingClientRect();
    const offsetTop = headerRef.current.getBoundingClientRect().bottom;
    return (
      rect.top >= offsetTop && rect.bottom <= offsetTop + (window.innerHeight || document.documentElement.clientHeight)
    );
  }, []);

  useEffect(() => {
    const rootElement = rootRef.current;
    if (!rootElement) return;

    const handler = () => {
      const elements = rootElement.getElementsByClassName('Anchor');
      for (let i = 0; i < elements.length; i++) {
        if (isElementInViewport(elements.item(i))) {
          form.setStore(s => {
            s.state.activeID = elements.item(i).id;
            return s;
          });
          break;
        }
      }
    };

    handler();
    rootElement.addEventListener('scroll', handler, false);
    return () => {
      rootElement.removeEventListener('scroll', handler, false);
    };
  }, [form, isElementInViewport]);

  useEffect(() => {
    form.setStore(s => {
      s.state.disabled = !currentUser.is_admin && !currentUser.roles.includes('self_manage');
      s.state.customize = currentUser.is_admin || currentUser.roles.includes('submission_customize');
      return s;
    });

    // Load user on start
    apiCall<UserSettings>({
      url: `/api/v4/user/settings/${currentUser.username}/`,
      onSuccess: ({ api_response }) => {
        form.setStore(s => {
          const settings = { ...api_response, ...s.next };
          s.next = _.cloneDeep(decompressSubmissionProfiles({ ...settings, ...DEFAULT_SETTINGS }, currentUser));
          s.prev = _.cloneDeep(decompressSubmissionProfiles({ ...settings, ...DEFAULT_SETTINGS }, currentUser));

          const nextTab = ['interface', ...Object.keys(s.next.profiles)].includes(tabParam) ? tabParam : 'interface';
          navigate(`/settings2/${nextTab}`);

          return s;
        });
      },
      onEnter: () =>
        form.setStore(s => {
          s.state.loading = true;
          return s;
        }),
      onExit: () =>
        form.setStore(s => {
          s.state.loading = false;
          return s;
        })
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  useEffect(() => {
    form.setStore(s => {
      if (!s.next) return s;
      s.state.tab = ['interface', ...Object.keys(s.next.profiles)].includes(tabParam) ? tabParam : 'interface';
      return s;
    });
  }, [form, tabParam]);

  return (
    <>
      <form.Subscribe
        selector={state => [
          state.values.state.loading,
          state.values.state.disabled,
          state.values.state.tab,
          state.values.state.hidden,
          state.values.state.customize
        ]}
        children={props => {
          const loading = props[0] as boolean;
          const disabled = props[1] as boolean;
          const tab = props[2] as SettingsStore['state']['tab'];
          const hidden = props[3] as boolean;
          const customize = props[4] as boolean;

          return (
            <div className={classes.root} ref={rootRef}>
              <div className={classes.navigation}>
                <Tab rootElement={rootRef.current} loading={loading} profile={tab} />
              </div>

              <div className={classes.wrapper}>
                <div className={classes.container}>
                  <div className={classes.header} ref={headerRef}>
                    <HeaderSection loading={loading} hidden={hidden} profile={tab} />
                  </div>

                  <div className={classes.content}>
                    {!tab ? null : tab === 'interface' ? (
                      <InterfaceSection loading={loading} disabled={disabled} />
                    ) : (
                      <>
                        <SubmissionSection
                          loading={loading}
                          disabled={disabled}
                          hidden={hidden}
                          customize={customize}
                          profile={tab}
                        />
                        <ExternalSourcesSection
                          loading={loading}
                          disabled={disabled}
                          hidden={hidden}
                          customize={customize}
                          profile={tab}
                        />
                        <ServicesSection
                          loading={loading}
                          disabled={disabled}
                          hidden={hidden}
                          customize={customize}
                          profile={tab}
                        />
                      </>
                    )}

                    <div style={{ height: window.innerHeight / 2 }} />
                  </div>
                </div>
              </div>

              <div className={classes.navigation}>
                <Navigation
                  loading={loading}
                  disabled={disabled}
                  hidden={hidden}
                  customize={customize}
                  profile={tab}
                  onScroll={handleScroll}
                />
              </div>
            </div>
          );
        }}
      />
    </>
  );
};

const WrappedSettingsPage = () => {
  const { t } = useTranslation(['settings']);
  const { apiCall } = useMyAPI();
  const { user: currentUser } = useALContext();
  const { showErrorMessage, showSuccessMessage } = useMySnackbar();

  const handleSubmit = useCallback(
    ({
      value,
      formApi
    }: {
      value: SettingsStore;
      formApi: FormApi<SettingsStore, Validator<SettingsStore, string>>;
    }) => {
      // console.log(compressSubmissionProfiles(value.next, currentUser));

      formApi.store.setState(s => {
        s.values.state.confirm = false;
        return s;
      });

      return null;

      if (value.next) {
        apiCall({
          url: `/api/v4/user/settings/${currentUser.username}/`,
          method: 'POST',
          body: value.next,
          onSuccess: () => {
            formApi.store.setState(s => {
              s.values.prev = _.cloneDeep(s.values.next);
              return s;
            });
            showSuccessMessage(t('success_save'));
          },
          onFailure: api_data => {
            if (api_data.api_status_code === 403) {
              showErrorMessage(api_data.api_error_message);
            }
          },
          onEnter: () =>
            formApi.store.setState(s => {
              s.values.state.submitting = true;
              return s;
            }),
          onExit: () =>
            formApi.store.setState(s => {
              s.values.state.submitting = false;
              return s;
            })
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser.username, t]
  );

  return (
    <FormProvider onSubmit={handleSubmit}>
      <SettingsContent />
    </FormProvider>
  );
};

export const SettingsPage = React.memo(WrappedSettingsPage);
export default SettingsPage;
