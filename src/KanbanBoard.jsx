import React, { useState, useEffect } from 'react';
import addIcon from './icons_FEtask/add.svg';
import cancelledIcon from './icons_FEtask/Cancelled.svg';
import backlogIcon from './icons_FEtask/Backlog.svg';
import todoIcon from './icons_FEtask/To-do.svg';
import inProgressIcon from './icons_FEtask/in-progress.svg';
import doneIcon from './icons_FEtask/Done.svg';
import lowPriorityIcon from './icons_FEtask/Img - Low Priority.svg';
import mediumPriorityIcon from './icons_FEtask/Img - Medium Priority.svg';
import highPriorityIcon from './icons_FEtask/Img - High Priority.svg';
import urgentPriorityIcon from './icons_FEtask/SVG - Urgent Priority colour.svg';
import noPriorityIcon from './icons_FEtask/No-priority.svg';
import displayIcon from './icons_FEtask/Display.svg';
import threeDotMenuIcon from './icons_FEtask/3 dot menu.svg';

const priorityIcons = {
  0: noPriorityIcon,
  1: lowPriorityIcon,
  2: mediumPriorityIcon,
  3: highPriorityIcon,
  4: urgentPriorityIcon,
};

const statusIcons = {
  'Backlog': backlogIcon,
  'Todo': todoIcon,
  'In progress': inProgressIcon,
  'Done': doneIcon,
  'Cancelled': cancelledIcon,
};

export default function KanbanBoard() {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [grouping, setGrouping] = useState(() => localStorage.getItem('grouping') || 'status');
  const [sorting, setSorting] = useState(() => localStorage.getItem('sorting') || 'priority');
  const [isDisplayOpen, setIsDisplayOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem('grouping', grouping);
  }, [grouping]);

  useEffect(() => {
    localStorage.setItem('sorting', sorting);
  }, [sorting]);

  const fetchData = async () => {
    try {
      const response = await fetch('https://api.quicksell.co/v1/internal/frontend-assignment');
      const data = await response.json();
      setTickets(data.tickets);
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleGroupingChange = (e) => {
    setGrouping(e.target.value);
    setIsDisplayOpen(false);
  };

  const handleSortingChange = (e) => {
    setSorting(e.target.value);
    setIsDisplayOpen(false);
  };

  const groupTickets = (tickets) => {
    return tickets.reduce((acc, ticket) => {
      const key = grouping === 'user' ? ticket.userId : ticket[grouping];
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(ticket);
      return acc;
    }, {});
  };

  const sortTickets = (groupedTickets) => {
    const sortedGroups = Object.entries(groupedTickets).sort(([a], [b]) => a.localeCompare(b));
    return Object.fromEntries(
      sortedGroups.map(([key, tickets]) => [
        key,
        tickets.sort((a, b) => {
          if (sorting === 'priority') {
            return b.priority - a.priority;
          } else {
            return a.title.localeCompare(b.title);
          }
        }),
      ])
    );
  };

  const getGroupTitle = (key) => {
    switch (grouping) {
      case 'status':
        return key;
      case 'user':
        const user = users.find(u => u.id === key);
        return user ? user.name : 'Unassigned';
      case 'priority':
        const priorities = ['No priority', 'Low', 'Medium', 'High', 'Urgent'];
        return priorities[key] || 'Unknown';
      default:
        return key;
    }
  };

  const groupedAndSortedTickets = sortTickets(groupTickets(tickets));
  const columnCount = Object.keys(groupedAndSortedTickets).length;

  return (
    <div style={styles.app}>
      <div style={styles.header}>
        <button style={styles.displayButton} onClick={() => setIsDisplayOpen(!isDisplayOpen)}>
          <img src={displayIcon} alt="Display" style={styles.icon} />
          Display
          <span style={styles.arrowIcon}>{isDisplayOpen ? '▲' : '▼'}</span>
        </button>
        {isDisplayOpen && (
          <div style={styles.displayOptions}>
            <div style={styles.option}>
              <label>Grouping</label>
              <select 
                style={styles.select} 
                value={grouping} 
                onChange={handleGroupingChange}
              >
                <option value="status">Status</option>
                <option value="user">User</option>
                <option value="priority">Priority</option>
              </select>
            </div>
            <div style={styles.option}>
              <label>Ordering</label>
              <select 
                style={styles.select} 
                value={sorting} 
                onChange={handleSortingChange}
              >
                <option value="priority">Priority</option>
                <option value="title">Title</option>
              </select>
            </div>
          </div>
        )}
      </div>
      <div style={{ ...styles.board, gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}>
        {Object.entries(groupedAndSortedTickets).map(([groupName, groupTickets]) => (
          <div key={groupName} style={styles.column}>
            <div style={styles.columnHeader}>
              <div style={styles.columnHeaderLeft}>
                <img 
                  src={grouping === 'status' ? statusIcons[groupName] : (grouping === 'priority' ? priorityIcons[groupName] : addIcon)} 
                  alt={groupName} 
                  style={styles.icon} 
                />
                <h2 style={styles.columnTitle}>{getGroupTitle(groupName)}</h2>
                <span style={styles.ticketCount}>{groupTickets.length}</span>
              </div>
              <div style={styles.columnHeaderRight}>
                <img src={addIcon} alt="Add" style={styles.icon} />
                <img src={threeDotMenuIcon} alt="Menu" style={styles.icon} />
              </div>
            </div>
            <div style={styles.cardContainer}>
              {groupTickets.map((ticket) => (
                <div key={ticket.id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <span style={styles.ticketId}>{ticket.id}</span>
                    <div style={styles.userAvatar}>
                      {users.find(user => user.id === ticket.userId)?.name.charAt(0)}
                    </div>
                  </div>
                  <h3 style={styles.cardTitle}>{ticket.title}</h3>
                  <div style={styles.cardFooter}>
                    <img src={priorityIcons[ticket.priority]} alt="Priority" style={styles.priorityIcon} />
                    {ticket.tag.map((tag, index) => (
                      <span key={index} style={styles.tag}>
                        <span style={styles.tagDot}>●</span> {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  app: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f4f5f8',
    minHeight: '100vh',
    padding: '20px',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  header: {
    marginBottom: '20px',
    position: 'relative',
  },
  displayButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  displayOptions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: '5px',
    padding: '10px',
    backgroundColor: 'white',
    borderRadius: '5px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    zIndex: 1000,
    minWidth: '200px',
  },
  option: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  select: {
    padding: '2px 5px',
    borderRadius: '3px',
    border: '1px solid #e0e0e0',
    backgroundColor: '#f4f5f8',
  },
  board: {
    display: 'grid',
    gap: '20px',
    width: '100%',
    maxWidth: '100%',
    margin: '0 auto',
    padding: '10px 0',
  },
  column: {
    backgroundColor: '#f4f5f8',
    borderRadius: '8px',
    padding: '10px',
    minWidth: 0,
    width: '100%',
  },
  cardContainer: {
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 200px)',
  },
  columnHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  columnHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  columnHeaderRight: {
    display: 'flex',
    gap: '10px',
  },
  columnTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginLeft: '8px',
    color: '#333',
  },
  ticketCount: {
    fontSize: '12px',
    marginLeft: '8px',
    color: '#666',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '10px',
    marginBottom: '10px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s',
    cursor: 'pointer',
    overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  ticketId: {
    fontSize: '12px',
    color: '#999',
  },
  cardTitle: {
    fontSize: '14px',
    color: '#333',
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '10px',
  },
  priorityIcon: {
    marginRight: '10px',
    height: '16px',
    width: '16px',
  },
  tag: {
    backgroundColor: '#e0e0e0',
    borderRadius: '12px',
    padding: '2px 8px',
    fontSize: '10px',
    color: '#333',
    marginLeft: '6px',
  },
  tagDot: {
    color: '#333',
    marginRight: '4px',
  },
  icon: {
    width: '16px',
    height: '16px',
  },
  userAvatar: {
    backgroundColor: '#666',
    color: 'white',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
  },
};