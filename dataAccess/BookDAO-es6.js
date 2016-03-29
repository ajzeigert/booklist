const ObjectId = require('mongodb').ObjectID;
const DAO = require('./DAO');

class BookDAO extends DAO {
    constructor(userId){
        super();
        this.userId = userId;
    }
    async searchBooks(search, subjects, searchChildSubjects){
        subjects = (subjects || []).map(_id => ObjectId(_id));
        let db = await super.open();
        try {
            let query = { userId: this.userId };
            if (search){
                query.title = new RegExp(search, 'gi');
            }

            if (subjects.length){
                if (searchChildSubjects){
                    let allPaths = subjects.map(s => `,${s},`).join('|');
                    let childIds = (await db.collection('subjects').find({ path: { $regex: allPaths }, userId: this.userId }, { _id: 1 }).toArray()).map(o => o._id);

                    subjects.push(...childIds);
                }

                query.subjects = { $in: subjects }
            }
            //may implement $or another way
            //if (query.title && query.subjects){
            //    query.$or = [
            //        { subjects: query.subjects },
            //        { title: query.title }
            //    ];
            //    delete query.subjects;
            //    delete query.title;
            //}
            return await db.collection('books').find(query).toArray();
        } finally {
            super.dispose(db);
        }
    }
    async saveBook(book){
        let db = await super.open();
        try {
            book.userId = this.userId;
            let result = await db.collection('books').insert(book);

            super.confirmSingleResult(result);
        } finally {
            super.dispose(db);
        }
    }
    async deleteBook(id){
        let db = await super.open();
        try {
            await db.collection('books').remove({ _id: ObjectId(id) });
        } finally {
            super.dispose(db);
        }
    }
    async setBooksSubjects(books, add, remove){
        let db = await super.open();
        try{
            await db.collection('books').update(
                { _id: { $in: books.map(_id => ObjectId(_id)) } },
                { $addToSet: { subjects: { $each: (add || []).map(_id => ObjectId(_id)) } } }, false, true
            );

            await db.collection('books').update(
                { _id: { $in: books.map(_id => ObjectId(_id)) } },
                { $pullAll: { subjects: (remove || []).map(_id => ObjectId(_id)) } }, false, true
            );

        } finally {
            super.dispose(db);
        }
    }
}

export default BookDAO;