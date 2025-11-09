/* eslint-disable no-unused-vars */
import { createSlice } from "@reduxjs/toolkit";
import { books } from "../../mockdata";

const bookSlice = createSlice({
    name: "book",
    initialState: {
        books: [],
        loading: false,
        error: null
    },
    reducers: {
        getBooks: (state, action) => {
            return state.books;
        },
        updateBooks: (state, action) => {
            state.books = action.payload;
        },
        addBook: (state, action) => {
            state.books.unshift(action.payload);
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        }
    }
});

export const { getBooks, addBook, updateBooks, setLoading, setError } = bookSlice.actions;
export default bookSlice.reducer;