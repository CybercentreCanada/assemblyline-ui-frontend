import React from "react";
import i18n from "i18next";
import {
  Typography,
  useTheme,
  List,
  ListItem,
  Box,
  Divider,
  ListSubheader,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import useAppLayout from "commons/components/hooks/useAppLayout";
import withWidth, { isWidthDown, isWidthUp } from '@material-ui/core/withWidth';

export enum Lang {
  EN = "en",
  FR = "fr",
}

const isLang = (lang: Lang): boolean => {
  return i18n.language === lang.valueOf();
};

const ThemeSelection = (props) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { 
    currentLayout, 
    showQuickSearch, 
    autoHideAppbar, 
    layoutProps, 
    breadcrumbsEnabled, 
    breadcrumbsState, 
    toggleLayout, 
    toggleTheme, 
    toggleQuickSearch, 
    toggleAutoHideAppbar, 
    toggleShowBreadcrumbs, 
    toggleBreadcrumbsState,
  } = useAppLayout();

  const onToggleLanguage = () => {
    i18n.changeLanguage(
      isLang(Lang.EN) ? Lang.FR.valueOf() : Lang.EN.valueOf()
    );
  };

  const clearStorage = () => {
    localStorage.clear();
    window.location.reload();
  }

  return <Box>
    <List dense subheader={<ListSubheader disableSticky>{t("app.language")}</ListSubheader>}>
      <ListItem dense button onClick={onToggleLanguage}>
        <ListItemText style={{margin: 0}}><Box display="flex" alignItems="center" flexDirection="row" width="100%" style={{textAlign: "center", cursor: "pointer"}}>
            <Typography component="div" variant="body2">English</Typography>
            <div style={{flexGrow: 1}}>
              <Switch checked={isLang(Lang.FR)} name="langSwitch" />
            </div>
            <Typography component="div" variant="body2">Français</Typography>
          </Box></ListItemText>
      </ListItem>
    </List>
    <Divider />
    <List dense subheader={<ListSubheader disableSticky>{t("personalization")}</ListSubheader>}>
      <ListItem button onClick={toggleTheme}>
        <ListItemText>{t("personalization.dark")}</ListItemText>
        <ListItemSecondaryAction>
          <Switch
            edge="end"
            onChange={toggleTheme}
            checked={theme.palette.type === "dark"}
          />
        </ListItemSecondaryAction>
      </ListItem>
      <ListItem button onClick={toggleLayout}>
        <ListItemText>{t("personalization.sticky")}</ListItemText>
        <ListItemSecondaryAction onClick={toggleLayout}>
          <Switch
              edge="end"
              checked={currentLayout === "top"}
            />
        </ListItemSecondaryAction>
      </ListItem>
      { layoutProps.allowQuickSearch ? 
        <ListItem button disabled={isWidthDown("xs", props.width)} onClick={toggleQuickSearch}>
          <ListItemText>{t("personalization.quicksearch")}</ListItemText>
          <ListItemSecondaryAction>
            <Switch
                edge="end"
                disabled={isWidthDown("xs", props.width)}
                checked={showQuickSearch === true && isWidthUp("xs", props.width)}
                onClick={toggleQuickSearch}
              />
          </ListItemSecondaryAction>
        </ListItem> : null}
      <ListItem button 
              disabled={currentLayout === "top"}
              onClick={toggleAutoHideAppbar}>
        <ListItemText>{t("personalization.autohideappbar")}</ListItemText>
        <ListItemSecondaryAction>
          <Switch
              disabled={currentLayout === "top"}
              edge="end"
              checked={autoHideAppbar === true && currentLayout !== "top"}
              onClick={toggleAutoHideAppbar}
            />
        </ListItemSecondaryAction>
      </ListItem>
      {layoutProps.allowBreadcrumbs ? <><ListItem button disabled={isWidthDown("xs", props.width)} onClick={toggleShowBreadcrumbs}>
          <ListItemText>{t("personalization.showbreadcrumbs")}</ListItemText>
          <ListItemSecondaryAction>
            <Switch
              edge="end"
              disabled={isWidthDown("xs", props.width)}
              checked={breadcrumbsEnabled && isWidthUp("xs", props.width)}
              onClick={toggleShowBreadcrumbs}
              />
          </ListItemSecondaryAction>
        </ListItem>        
        {breadcrumbsEnabled ? <ListItem button disabled={isWidthDown("xs", props.width)} onClick={toggleBreadcrumbsState}>
        <ListItemText>{t("personalization.minimizebreadcrumbs")}</ListItemText>
          <ListItemSecondaryAction>
            <Switch
              edge="end"
              disabled={isWidthDown("xs", props.width)}
              checked={!breadcrumbsState && isWidthUp("xs", props.width)}
              onClick={toggleBreadcrumbsState}
              />
          </ListItemSecondaryAction>
        </ListItem> : null}        
      </>: null}
    </List>
    {layoutProps.allowReset ? 
      <Box>
        <Divider />
        <List dense>
          <ListItem dense button onClick={clearStorage}>
            <ListItemText>{t("personalization.reset_text")}</ListItemText>
          </ListItem>
        </List>
      </Box> : null}
  </Box>
  
}

export default withWidth()(ThemeSelection);