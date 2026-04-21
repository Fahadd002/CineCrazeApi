import { Prisma } from "../../../generated/prisma/client"

export const contentSearchableFields = [
    'id',
    'title',
    'cast',
    'director'
]

export const contentFilterableFields = [
    'id',
    'managerId',
    'genre',
    'releaseDate',
    'mediaType',
    'ticketPrice',
    'createdAt',
    'updatedAt'
]

// export const contentIncludeConfig : Partial<Record<keyof Prisma.ContentInclude, Prisma.ContentInclude[keyof Prisma.ContentInclude]>> ={
//    _count: {
//         select: {
//             reviews: true  // ✅ Total review count
//         }
//     },
//     reviews: {
//         include: {
//             viewer: {
//                 select: { 
//                     id: true,
//                     name: true,
//                     profilePhoto: true
//                 }
//             },
//             _count: {
//                 select: {
//                     likes: true  // Likes count per review
//                 }
//             },
//             replies: {
//                 include: {
//                     viewer: {
//                         select: { 
//                             id: true,
//                             name: true,
//                             profilePhoto: true
//                         }
//                     },
//                     _count: {
//                         select: {
//                             likes: true
//                         }
//                     }
//                 }
//             }
//         }
//     }
// }

export const contentIncludeConfig = {
    _count: {
        select: {
            reviews: true
        }
    },
    reviews: {
        include: {
            viewer: {
                select: { 
                    id: true,
                    name: true,
                    profilePhoto: true
                }
            },
            _count: {
                select: {
                    likes: true
                }
            },
            replies: {
                include: {
                    viewer: {
                        select: { 
                            id: true,
                            name: true,
                            profilePhoto: true
                        }
                    },
                    _count: {
                        select: {
                            likes: true
                        }
                    }
                }
            }
        }
    }
} satisfies Prisma.ContentInclude;
