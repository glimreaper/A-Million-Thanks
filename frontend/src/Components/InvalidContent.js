import React, {useState, useEffect} from 'react';

import { lighten, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import FilterListIcon from '@material-ui/icons/FilterList';
import Button from '@material-ui/core/Button';
import ReactDOM from 'react-dom';
import TablePagination from '@material-ui/core/TablePagination';
import TableSortLabel from '@material-ui/core/TableSortLabel';

import MaterialTable from 'material-table';
import axios from 'axios';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
}));

function createRow(name, street, city, state, zip, capdate, id) {
  return { name, street, city, state, zip, capdate,id };
}

// custom stable sort algorithm where we can use cmp=(ascending or descending) to determine sort 
function stableSort(array, cmp) {
  const stabilizedArray = array.map((item, index) => [item,index]);

  // function argument passed into sort here makes use of current cmp function
  stabilizedArray.sort((a,b) => {
    const order = cmp(a[0], b[0]);
    if(order !== 0) return order; // positive or negative indicates relative order found so return value
    return a[1] - b[1];
  });
  return stabilizedArray.map(item => item[0]);
}

function desc(a, b, orderBy) {
  if(b[orderBy] < a[orderBy]) {
    return -1;
  }
  if(b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getSorting(order, orderBy) {
  return order === 'desc' ? (a,b) => desc(a,b,orderBy): (a,b) => -desc(a,b,orderBy);
}

// ----------------------- Enhanced Table Header ---------------------------
// function EnhancedTableHead(props) {
//   const {classes, order, orderBy, onRequestSort, rowCount} = props;
//   const createSortHandler = property => event => {
//     onRequestSort(event, property);
//   };

//   return (
//     <TableHead>
//       <TableRow>
//         {headerCells.map((header, index) => (
//           <TableCell
//             key={header.id}
//             sortDirection={orderBy === header.id ? order : false}
//           >
//             <TableSortLabel 
//               active={orderBy === header.id}
//               direction={order}
//               onClick={createSortHandler(header.id)}
//             >
//               {header.label}
//               {orderBy === header.id ? (
//                 <span className={classes.visuallyHidden}>
//                   {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
//                 </span>
//               ) : null}
//             </TableSortLabel>
//           </TableCell>
//         ))} 
//       </TableRow>
//     </TableHead>
//   )
// }

// const headerCells = [
//   {id:"name", label:"Image"},
//   {id:"street", label:"Street"},
//   {id:"city", label:"City"},
//   {id:"state", label:"State"},
//   {id:"zip", label:"Zip"},
//   {id:"capdate", label:"Capture Date"}
// ]

// ----------------------- export function ----------------------------------
export default function InvalidContent() {
  // data variable to store address data
  // initialized to empty arrays

// shoot() {
//     alert("UPDATED");
//   }

  const [data, setData] = useState({
    names:[],
    street:[],
    city:[],
    state:[],
    zip:[],
    id: [],
    capdate:[]});
  const [dataRows, setDataRows] = useState([]);
  const classes = useStyles();
    
  // fetches data from db and populates <data> variable
  useEffect(() => {
    const fetchData = async () => {
      // console.log("FETCH");
      const result = await fetch("http://localhost:9000/fixaddress/invalid",{
        method: 'POST',
        headers:{
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      .then(res => res.json())
      .then(res => {        
        // read attribute values into temp arrays
        let tempNames = JSON.parse(res.names);
        let tempStreet = JSON.parse(res.streets);
        let tempCity = JSON.parse(res.cities);
        let tempState = JSON.parse(res.state);
        let tempZip = JSON.parse(res.zips);
        let tempCapDate = JSON.parse(res.capdates);
        let tempID= JSON.parse(res.ids);

        // set state data to data in temp arrays
        setData({
          names: [...tempNames],
          street: [...tempStreet],
          city:[...tempCity],
          state:[...tempState],
          zip:[...tempZip],
          id:[...tempID],
          capdate:[...tempCapDate]
        });
      });
    };
    fetchData();
  }, []);


  // this effect is called upon change in <data> (after loading data from db) to populate dataRows
  useEffect(() => {
    // console.log("[useEffect2] At time of createDataRows call, data is length:", data["names"].length);
    const createRowsAsync = async() => {
      // console.log("[useEffect2][async] data.length:", data["names"].length)
      let newDataRows = []; // temp variable to aggregate new data rows
      data["names"].map((addr, index) => 
        newDataRows.push(createRow(data["names"][index], 
        data["street"][index], 
        data["city"][index], 
        data["state"][index], 
        data["zip"][index], 
        data["capdate"][index],
        data["id"][index])
      ))
      // console.log("newData")
      setDataRows(newDataRows);
    }
    createRowsAsync();
    // console.log("[useEffect2] dataRows.length:", dataRows.length);
  }, [data]);

  // Pagination Implmentation
  const [page, setPage] = React.useState(0); // reads value from useState into page (page = 0)
  const [rowsPerPage, setRowsPerPage] = React.useState(20);
  
  const[order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState("capdate") 

  const handleChangePage = (event, newPage) => {
    // console.log("newPage:", newPage);
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // reset page to first page
  };

  const handleRequestSort = (event, currentOrderReq) => {
    if(orderBy === currentOrderReq && order === 'desc') {
      // previous orderBy is the same as current order request and current order is desc -> change order to ascending
      setOrder('asc');
    }
    else {
      setOrder('desc');
    }
    setOrderBy(currentOrderReq);
  }

  // Material Table
  const [headerCells_MT, setHeaderCells_MT] = React.useState([
    {field:"name", title:"Name"},
    {field:"street", title:"Street"},
    {field:"city", title:"City"},
    {field:"state", title:"State"},
    {field:"zip", title:"Zip"},
    {field:"capdate", title:"Capture Date"},
    {field:"id", title:"ID"}
  ]);

  return(
    // conditional return -> if dataRows is populated, display data; else, display "loading"
    dataRows.length ?
    <MaterialTable 
      title="Click the icon to edit an entry:"
      columns={headerCells_MT}
      data={dataRows}
      detailPanel={[{
        disabled:false,
        render: rowData => {
          return (
            <div>
              <img width="100%" src={"http://localhost:9000/" + rowData.name.substring(8)}/>
            </div>
          );
        }
      }]}
      options={{
        search:false,
      }}
      editable={{
        onRowUpdate: (newData, oldData) => 
          new Promise((resolve,reject) => {
            setTimeout(() => {
              resolve();
              // make axios post with new data 
              axios.post("http://localhost:9000/update/", newData);
              // if(oldData) {
              //   setData(prevData => {
              //     const data = [prevData];
              //     data[data.indexOf(oldData)] = newData;
              //     return {...prevData, data};
              //   }) 
              // }
            }, 300)
          })
      }}
      />
    : <div> Loading... </div>
  );
}
 // ReactDOM.render(<InvalidContent />, document.getElementById('root'));

//export default InvalidContent;