import { AlertTitle, Skeleton } from '@mui/material';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import { ApiKey } from 'components/models/base/user';
import {
    DivTable,
    DivTableBody,
    DivTableCell,
    DivTableHead,
    DivTableRow,
    LinkRow,
    SortableHeaderCell
} from 'components/visual/DivTable';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import CustomChip from '../CustomChip';
import InformativeAlert from '../InformativeAlert';
import Moment from '../Moment';



export type ApikeySearchResults = {
    items: ApiKey[];
    rows: number;
    offset: number;
    total: number;
};

type ApiTableProps = {
    apikeySearchResults: ApikeySearchResults;
    setApikeyID?: (id: string) => void;
};

const WrappedUsersApiTable: React.FC<ApiTableProps> = ({ apikeySearchResults, setApikeyID = null }) => {
    const { t } = useTranslation(['apikeys']);

    return apikeySearchResults ? (
        apikeySearchResults.total !== 0 ? (
            <TableContainer component={Paper}>
                <DivTable size="small">
                    <DivTableHead>
                        <DivTableRow style={{ whiteSpace: 'nowrap' }}>
                            <SortableHeaderCell sortField="uname">{t("username")}</SortableHeaderCell>
                            <SortableHeaderCell sortField="key_name">{t("apikey")}</SortableHeaderCell>
                            <SortableHeaderCell sortField="creation_date">{t("creation_date")}</SortableHeaderCell>
                            <SortableHeaderCell sortField="expiry_ts">{t("expiration_date")}</SortableHeaderCell>
                            <SortableHeaderCell sortField="last_used">{t("last_used")}</SortableHeaderCell>
                            <SortableHeaderCell sortField="acl">{t("acl")}</SortableHeaderCell>
                            <SortableHeaderCell sortField="roles">{t("roles")}</SortableHeaderCell>
                        </DivTableRow>
                    </DivTableHead>

                    <DivTableBody>
                        {

                            apikeySearchResults.items.map(userApikey => (

                                <LinkRow key={userApikey.id} hover
                                    component={Link}
                                    to={`/admin/apikeys/#${userApikey.id}`}
                                    onClick={event => {
                                        if (setApikeyID && event) {
                                            event.preventDefault();
                                            setApikeyID(userApikey.id);
                                        }
                                    }}
                                    style={{ textDecoration: 'none' }}>
                                    <DivTableCell >{userApikey.uname}</DivTableCell>
                                    <DivTableCell >{userApikey.key_name}</DivTableCell>

                                    <DivTableCell><Moment variant="fromNow">{userApikey.creation_date}</Moment></DivTableCell>
                                    <DivTableCell>{userApikey.expiry_ts ? (<Moment variant="fromNow">{userApikey.expiry_ts}</Moment>) : (<></>)}</DivTableCell>
                                    <DivTableCell>{userApikey.last_used ? (<Moment variant="fromNow">{userApikey.last_used}</Moment>) : (<></>)}</DivTableCell>
                                    <DivTableCell>{userApikey.acl.sort().map((e, x) => (
                                        <CustomChip type="rounded" label={e} size="tiny" color="primary" />
                                    ))}</DivTableCell>
                                    <DivTableCell>{userApikey.roles.sort().map((e, x) => (
                                        <CustomChip type="rounded" label={t(`role.${e}`)} size="tiny" color="secondary" />
                                    ))}</DivTableCell>
                                </LinkRow>
                            ))

                        }

                    </DivTableBody>

                </DivTable>
            </TableContainer>
        ) : (
            <div style={{ width: '100%' }}>
                <InformativeAlert>
                    <AlertTitle>{t('no_apikey_title')}</AlertTitle>
                    {t('no_results_desc')}
                </InformativeAlert>
            </div>
        )
    ) : (
        <Skeleton variant="rectangular" style={{ height: '6rem', borderRadius: '4px' }} />
    );
};

const ApikeysTable = React.memo(WrappedUsersApiTable);
export default ApikeysTable;
