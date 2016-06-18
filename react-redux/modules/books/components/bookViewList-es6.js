import { loadSubjects } from '../reducers/subjects/actionCreators';
import { loadBooks } from '../reducers/books/actionCreators';
import responsiveMobileDesktopMixin from 'react-redux-util/responsiveUiLoaders';

import MainNavigationBar from 'root-components/mainNavigation';
import BooksMenuBar from './booklist-menubar/booksMenuBar';
import BookSubjectSetterDesktop from './bookSubjectSetter-desktop';
import SubjectEditModal from './subject-edit/subjectEditModal';
import BootstrapButton from 'root-components/bootstrapButton';
import ManualBookEntry from 'root-components/manualBookEntry';

import * as actionCreatorsBooks from '../reducers/books/actionCreators';
import * as actionCreatorsSubjects from '../reducers/subjects/actionCreators';
import * as actionCreatorsEditBook from '../reducers/editBook/actionCreators';

import { selector } from '../reducers/reducer';

function BookListLoading() {
    return <div style={{ height: '150' }}>Loading <i className="fa fa-spinner fa-spin"></i></div>
}

function BookListNoResults() {
    return <div style={{ height: '150' }}>No results</div>
}

class BookViewingList extends React.Component {
    constructor(){
        super();

        responsiveMobileDesktopMixin(this, 'listComponent', {
            mobile:  { path: './modules/books/components/bookViewList-mobile' },
            desktop: { path: './modules/books/components/bookViewList-desktop' }
        });
    }
    componentDidMount(){
        this.props.loadSubjects();
    }
    render() {
        let editingBook = this.props.bookEdit.editingBook,
            dragTitle = editingBook ? `Click or drag to upload a ${editingBook.smallImage ? 'new' : ''} cover image.  The uploaded image will be scaled down as needed` : '';

        return (
            <div>
                <MainNavigationBar isBookList={true}></MainNavigationBar>
                <div className="panel panel-default" style={{ margin: '10' }}>
                    <BooksMenuBar
                        selectedBooksCount={this.props.books.selectedBooksCount}
                        allSubjects={this.props.subjects.list}
                    ></BooksMenuBar>

                    <div className="panel-body" style={{ padding: 0, minHeight: 550, position: 'relative' }}>
                        { this.props.books.loading ?
                            <div className="wait-for-loading">
                                <i className="fa fa-5x fa-spin fa-spinner"></i>
                            </div> : null }
                        { !this.state.listComponent
                            ? <BookListLoading />
                            : React.createElement(this.state.listComponent, { })
                        }
                    </div>
                </div>
                <div className="well well-sm">
                    <img width="16" height="16" src="/static/main-icon.png" />
                    <span>Track my books</span>
                    { this.state.isMobile ?
                        <a onClick={() => this.switchToDesktop()} className="pull-right">Desktop site</a> : null
                    }
                </div>

                <BookSubjectSetterDesktop subjects={this.props.subjects}></BookSubjectSetterDesktop>
                <SubjectEditModal
                    editSubjectsPacket={this.props.subjects.editSubjectsPacket}
                    subjects={this.props.subjects.list}>
                </SubjectEditModal>

                <ManualBookEntry
                    title={editingBook ? `Edit ${editingBook.title}` : ''}
                    dragTitle={dragTitle}
                    bookToEdit={editingBook}
                    isOpen={this.props.bookEdit.isEditing}
                    isSaving={this.props.bookEdit.editingBookSaving}
                    isSaved={this.props.bookEdit.editingBookSaved}
                    saveBook={book => this.props.saveEditingBook(book)}
                    saveMessage={'Saved'}
                    onClosing={this.props.stopEditingBook} />
            </div>
        );
    }
}

const BookViewingListConnected = ReactRedux.connect(selector, { ...actionCreatorsEditBook, ...actionCreatorsSubjects })(BookViewingList);
export default BookViewingListConnected;