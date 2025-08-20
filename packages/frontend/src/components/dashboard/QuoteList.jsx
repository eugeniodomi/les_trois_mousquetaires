import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Paper, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider, Chip } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';

// ===== CORREÇÃO AQUI =====
export default function QuoteList({ title, quotes }) {
  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <List sx={{ width: '100%' }}>
        {quotes.map((quote, index) => (
          <React.Fragment key={quote.id}>
            <ListItem
              alignItems="flex-start"
              button
              component={RouterLink}
              to={`/cotacoes/${quote.id}`}
            >
              <ListItemAvatar>
                <Avatar>
                  <FolderIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={quote.name}
                secondary={
                  <React.Fragment>
                    <Typography component="span" variant="body2" color="text.primary">
                      {quote.distributor}
                    </Typography>
                    {` — ${quote.date}`}
                  </React.Fragment>
                }
              />
              {quote.status && <Chip label={quote.status} color="primary" size="small" />}
            </ListItem>
            {index < quotes.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
}