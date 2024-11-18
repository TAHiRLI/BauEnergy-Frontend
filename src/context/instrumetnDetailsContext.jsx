// import { createContext, useContext, useReducer } from "react";

// const InstrumentDetailsContext = createContext();

// const initialValues = {
//     data:null,
//     loading:false,
//     error:false
// }

//  export const InstrumentDetailsActions =  {
//     start: 'START',
//     success: 'SUCCESS',
//     failure: 'FAILURE',
//   };

// export const InstrumentDetailsReducer = (state, action) => {
//     switch (action.type) {
//       case InstrumentActions.start:
//         return {
//           data: null,
//           loading: true,
//           error: null,
//         };
//       case InstrumentActions.success:
//         return {
//           data: action.payload,
//           loading: false,
//           error: null,
//         };
//       case InstrumentActions.failure:
//         return {
//           data: null,
//           loading: false,
//           error: action.payload,
//         };
   
//       default:
//         return state;
//     }
//   };
  
// export const InstrumentProvider = ({children}) => {

//     const [state, dispatch] = useReducer(InstrumentReducer, initialValues);

//   return (
//     <InstrumentContext.Provider value={{state, dispatch}}>
//         {children}
//     </InstrumentContext.Provider>
//   )
// }

// export const useInstruments = ()=> useContext(InstrumentContext)