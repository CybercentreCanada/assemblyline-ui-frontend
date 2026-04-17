// import { useCallback } from 'react';

// export type MyAvatarsCollectionName = keyof typeof dicebearCollections;

// export const MyAvatarsCollectionNames = Object.keys(dicebearCollections) as MyAvatarsCollectionName[];

// export type MyAvatarsProps = {
//   text: string;
//   size?: number;
//   collection?: MyAvatarsCollectionName;
//   bgcolor?: string;
// };

// export const useMyAvatars = (_collection: MyAvatarsCollectionName = 'bottts') => {
//   const createUserAvatar = useCallback(
//     ({ collection, text, bgcolor, size = 40 }: MyAvatarsProps) => {
//       const style = (dicebearCollections[collection ?? _collection] ??
//         dicebearCollections.bottts) as unknown as Style<any>;

//       return createAvatar(style, {
//         size,
//         seed: text,
//         backgroundColor: bgcolor
//       }).toDataUri();
//     },
//     [_collection]
//   );

//   return createUserAvatar;
// };
