import type { Badlist } from 'components/models/base/badlist';
import type { RequestBuilder } from 'components/models/utils/request';

type SuccessResponse = { success: boolean };

/**
 * @name /badlist/
 * @description Add a hash in the badlist if it does not exist or update its list of sources if it does
 * @method POST_PUT
 */

type AddUpdateBadlistPostRequest = RequestBuilder<`/api/v4/badlist/`, 'POST', Badlist>;

type AddUpdateBadlistPutRequest = RequestBuilder<`/api/v4/badlist/`, 'PUT', Badlist>;

type AddUpdateBadlistResponse = {
  // Was the hash successfully added
  success: boolean;

  // Was it added to the system or updated
  op: 'add' | 'update';

  // Hash that was used to store the badlist item
  hash: string;
};

/**
 * @name /badlist/add_update_many/
 * @description Add or Update a list of the bad hashes
 * @method POST_PUT
 */

type AddUpdateManyBadlistPostRequest = RequestBuilder<`/api/v4/badlist/add_update_many/`, 'POST', Badlist[]>;

type AddUpdateManyBadlistPutRequest = RequestBuilder<`/api/v4/badlist/add_update_many/`, 'PUT', Badlist[]>;

type AddUpdateManyBadlistResponse = {
  // Number of hashes that succeeded
  success: number;

  // List of hashes that failed
  errors: string[];
};

/**
 * @name /badlist/<qhash>/
 * @description Check if a hash exists in the badlist.
 * @method GET
 * @param qhash Hash to check is exist (either md5, sha1, sha256, tlsh, or ssdeep)
 */

type CheckBadlistGetRequest = RequestBuilder<`/api/v4/badlist/${string}/`, 'GET', null>;

type CheckBadlistGetResponse = Badlist;

/**
 * @name /badlist/<tag_type>/<tag_value>/
 * @description Check if a tag exists in the badlist.
 * @method GET
 * @param tag_type Type of tag to search for
 * @param tag_value Value of the tag to search for
 */

type CheckTagBadlistGetRequest = RequestBuilder<`/api/v4/badlist/${string}/${string}/`, 'GET', null>;

type CheckTagBadlistGetResponse = Badlist;

/**
 * @name /badlist/<qhash>/
 * @description Delete a hash from the badlist
 * @method DELETE
 */

type BadlistDeleteRequest = RequestBuilder<`/api/v4/badlist/${string}/`, 'DELETE', null>;

/**
 * @name /badlist/enable/<qhash>/
 * @description Set the enabled status of a hash
 * @method PUT
 */

type EnableHashBadlistPutRequest = RequestBuilder<`/api/v4/badlist/enable/${string}/`, 'PUT', Badlist['enabled']>;

/**
 * @name /badlist/expiry/<qhash>/
 * @description Clear the expiry date of a hash
 * @method DELETE
 * @param qhash Hash to clear the expiry date from
 */
type ExpiryBadlistDeleteRequest = RequestBuilder<`/api/v4/badlist/expiry/${string}/`, 'DELETE', null>;

/**
 * @name /badlist/expiry/<qhash>/
 * @description Change the expiry date of a hash
 * @method PUT
 * @param qhash Hash to change the expiry date
 */
type ExpiryBadlistPutRequest = RequestBuilder<`/api/v4/badlist/expiry/${string}/`, 'PUT', Badlist['expiry_ts']>;

/**
 * @name /badlist/classification/<qhash>/<source>/<stype>/
 * @description Change the classification of a badlist item source
 * @method PUT
 * @param qhash Hash to change the classification of
 * @param source Source to change the classification of
 * @param stype Type of source to change the classification of
 */
type ClassificationBadlistPutRequest = RequestBuilder<
  `/api/v4/badlist/classification/${string}/${string}/${string}/`,
  'PUT',
  Badlist['classification']
>;

/**
 * @name /badlist/source/<qhash>/<source>/<stype>/
 * @description Change the classification of a badlist item source
 * @method DELETE
 * @param qhash Hash to remove the source from
 * @param source Name of the source to remove
 * @param stype Type of source to remove
 */
type SourceBadlistDeleteRequest = RequestBuilder<
  `/api/v4/badlist/source/${string}/${string}/${string}/`,
  'DELETE',
  null
>;

/**
 * @name /badlist/attribution/<qhash>/<attrib_type>/<value>/
 * @description Add an attribution to the coresponding hash
 * @method PUT
 * @param qhash Hash to change
 * @param attrib_type Type of attribution to add
 * @param value Value to add
 */
type AttributionBadlistPutRequest = RequestBuilder<
  `/api/v4/badlist/attribution/${string}/${string}/${string}/`,
  'PUT',
  null
>;

/**
 * @name /badlist/attribution/<qhash>/<attrib_type>/<value>/
 * @description Delete an attribution to the coresponding hash
 * @method PUT
 * @param qhash Hash to change
 * @param attrib_type Type of attribution to delete
 * @param value Value to delete
 */
type AttributionBadlistDeleteRequest = RequestBuilder<
  `/api/v4/badlist/attribution/${string}/${string}/${string}/`,
  'DELETE',
  null
>;

// prettier-ignore
export type BadlistRequests =
  | AddUpdateBadlistPostRequest
  | AddUpdateBadlistPutRequest
  | AddUpdateManyBadlistPostRequest
  | AddUpdateManyBadlistPutRequest
  | CheckBadlistGetRequest
  | CheckTagBadlistGetRequest
  | BadlistDeleteRequest
  | EnableHashBadlistPutRequest
  | ExpiryBadlistDeleteRequest
  | ExpiryBadlistPutRequest
  | ClassificationBadlistPutRequest
  | SourceBadlistDeleteRequest
  | AttributionBadlistPutRequest
  | AttributionBadlistDeleteRequest;

// prettier-ignore
export type BadlistResponses<Request extends BadlistRequests> =
  Request extends AddUpdateBadlistPostRequest ? AddUpdateBadlistResponse :
  Request extends AddUpdateBadlistPutRequest ? AddUpdateBadlistResponse :
  Request extends AddUpdateManyBadlistPostRequest ? AddUpdateManyBadlistResponse :
  Request extends AddUpdateManyBadlistPutRequest ? AddUpdateManyBadlistResponse :
  Request extends CheckBadlistGetRequest ? CheckBadlistGetResponse :
  Request extends CheckTagBadlistGetRequest ? CheckTagBadlistGetResponse :
  Request extends BadlistDeleteRequest ? SuccessResponse :
  Request extends EnableHashBadlistPutRequest ? SuccessResponse :
  Request extends ExpiryBadlistDeleteRequest ? SuccessResponse :
  Request extends ExpiryBadlistPutRequest ? SuccessResponse :
  Request extends ClassificationBadlistPutRequest ? SuccessResponse :
  Request extends SourceBadlistDeleteRequest ? SuccessResponse :
  Request extends AttributionBadlistPutRequest ? SuccessResponse :
  Request extends AttributionBadlistDeleteRequest ? SuccessResponse :
  never;
