import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonIcon, IonButton, IonSegment, IonSegmentButton, IonLabel, IonItem, IonSelect, IonSelectOption, IonDatetime, IonModal } from '@ionic/react';
import { add, chevronBackOutline, chevronForwardOutline, close } from 'ionicons/icons';
import './Agenda.css';
import logo from '../assets/logo.png';
import React, { useState, useMemo, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, isSameMonth, isToday, addDays, parseISO, startOfWeek, endOfWeek, isSameDay, setHours, setMinutes, addMinutes } from 'date-fns';
import { eachDayOfInterval } from 'date-fns/eachDayOfInterval';
import { es } from 'date-fns/locale';
import CreateActivityModal from '../components/CreateActivityModal';
import ActivityModal from '../components/ActivityModal';
import { Activity, ActivityInput, ACTIVITY_TYPES, ACTIVITY_LOCATIONS, ACTIVITY_STATUSES } from '../types/activity';
import Header from '../components/Header';
import { getResidentsByRole } from '../services/residentService';
import { useAuth } from '../contexts/AuthContext';

const Agenda: React.FC = () => {
  const {isAdmin,user} = useAuth();
  const [currentView, setCurrentView] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentDay, setCurrentDay] = useState(new Date());
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filterDate, setFilterDate] = useState<string | undefined>(undefined);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterResident, setFilterResident] = useState<number | 'all'>('all');
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [residents, setResidents] = useState<Array<{ id: number; nombre: string }>>([]);
  const [isEditing, setIsEditing] = useState(false);

  const handleViewChange = (view: 'daily' | 'weekly' | 'monthly') => {
    setCurrentView(view);
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(prevMonth => new Date(prevMonth.getFullYear(), prevMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 1));
  };

  const handlePreviousDay = () => {
    setCurrentDay(prevDay => addDays(prevDay, -1));
  };

  const handleNextDay = () => {
    setCurrentDay(prevDay => addDays(prevDay, 1));
  };

  const handlePreviousWeek = () => {
    setCurrentDay(prevDay => {
      const newDate = addDays(prevDay, -7);
      return startOfWeek(newDate, { weekStartsOn: 1 });
    });
  };

  const handleNextWeek = () => {
    setCurrentDay(prevDay => {
      const newDate = addDays(prevDay, 7);
      return startOfWeek(newDate, { weekStartsOn: 1 });
    });
  };

  const clearDateFilter = () => {
    setFilterDate(undefined);
  };

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const timeSlots = Array.from({ length: 14 }, (_, i) => `${7 + i}:00`);

  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  const daysInMonth = useMemo(() => eachDayOfInterval({ start, end }), [currentMonth]);

  const weeks = useMemo(() => {
    const weeksArray: Date[][] = []; 
    let currentWeek: Date[] = [];
    const firstDayOfMonth = daysInMonth[0];
    const startingDayOfWeek = firstDayOfMonth.getDay();

    const daysBefore = (startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1);
    for (let i = 0; i < daysBefore; i++) {
      const day = new Date(firstDayOfMonth);
      day.setDate(firstDayOfMonth.getDate() - (daysBefore - i));
      currentWeek.push(day);
    }

    daysInMonth.forEach((day: Date) => { 
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeksArray.push(currentWeek);
        currentWeek = [];
      }
    });

    const lastDayOfMonth = daysInMonth[daysInMonth.length - 1];
    const endingDayOfWeek = lastDayOfMonth.getDay();
    const daysAfter = (endingDayOfWeek === 0 ? 0 : 7 - endingDayOfWeek);
    for (let i = 0; i < daysAfter; i++) {
      const day = new Date(lastDayOfMonth);
      day.setDate(lastDayOfMonth.getDate() + (i + 1));
      currentWeek.push(day);
    }

    if (currentWeek.length > 0) {
       weeksArray.push(currentWeek);
    }

    return weeksArray;
  }, [daysInMonth]);

  useEffect(() => {
    const fetchResidents = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No hay sesión activa');
          return;
        }
        const data = await getResidentsByRole(token)

        setResidents(data.map((resident: any) => ({
          id: resident.id,
          nombre: resident.nombre
        })));
      } catch (error) {
        console.error('Error fetching residents:', error);
      }
    };

    fetchResidents();
  }, []);

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || residents.length === 0) {
        return;
      }

      const response = await fetch('/api/activities/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar las actividades');
      }

      const data = await response.json();

      const residentIds = residents.map(r => r.id);

      const filtered = data.data
        .filter((activity: Activity) => residentIds.includes(activity.residente_id))
        .map((activity: Activity) => ({
          ...activity,
          fecha: new Date(activity.fecha)
        }));

      setActivities(filtered);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [residents]);

  const handleCreateActivity = async (activityData: ActivityInput) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      const response = await fetch('/api/activities/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(activityData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al crear la actividad');
      }

      await fetchActivities();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  };

  const filterActivities = (activities: Activity[]) => {
    return activities.filter(activity => {
      const activityDate = new Date(activity.fecha);
      const filterD = filterDate ? parseISO(filterDate) : null;

      const dateMatch = filterD ?
        activityDate.getFullYear() === filterD.getFullYear() &&
        activityDate.getMonth() === filterD.getMonth() &&
        activityDate.getDate() === filterD.getDate()
        : true;

      const typeMatch = filterType === 'all' || activity.tipo === filterType;
      const locationMatch = filterLocation === 'all' || activity.lugar === filterLocation;
      const statusMatch = filterStatus === 'all' || activity.estado === filterStatus;
      const residentMatch = filterResident === 'all' || activity.residente_id === filterResident;

      return dateMatch && typeMatch && locationMatch && statusMatch && residentMatch;
    });
  };

  const getActivitiesForDay = (date: Date) => {
    const filteredActivities = filterActivities(activities);
    return filteredActivities.filter(activity => 
      isSameDay(new Date(activity.fecha), date)
    );
  };

  const getActivitiesForTimeSlot = (date: Date, timeSlot: string) => {
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const slotStart = setHours(setMinutes(date, minutes), hours);
    const slotEnd = addMinutes(slotStart, 60);

    const filteredActivities = filterActivities(activities);
    return filteredActivities.filter(activity => {
      const activityDate = new Date(activity.fecha);
      return isSameDay(activityDate, date) && 
             activityDate >= slotStart && 
             activityDate < slotEnd;
    });
  };

  const getActivitiesForWeek = (weekStart: Date) => {
    const weekEnd = addDays(weekStart, 6);
    const filteredActivities = filterActivities(activities);
    return filteredActivities.filter(activity => {
      const activityDate = new Date(activity.fecha);
      return activityDate >= weekStart && activityDate <= weekEnd;
    });
  };

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsActivityModalOpen(true);
  };

  const handleActivitySave = async (activityData: ActivityInput) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      const method = selectedActivity?.id ? 'PUT' : 'POST';
      const url = selectedActivity?.id 
        ? `/api/activities/${selectedActivity.id}`
        : '/api/activities/';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(activityData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al guardar la actividad');
      }

      await fetchActivities();
    } catch (error) {
      console.error('Error saving activity:', error);
      throw error;
    }
  };

  const handleActivityDelete = async (activityId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      const response = await fetch(`/api/activities/${activityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al eliminar la actividad');
      }

      await fetchActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
      throw error;
    }
  };

  const renderActivityBlock = (activity: Activity) => (
    <div 
      key={activity.id} 
      className={`activity-block ${activity.tipo.toLowerCase()}`}
      onClick={() => handleActivityClick(activity)}
    >
      <div className="activity-time">
        {format(new Date(activity.fecha), 'HH:mm')}
      </div>
      <div className="activity-title">{activity.titulo}</div>
      <div className="activity-type">{activity.tipo}</div>
    </div>
  );

  const getActivityTypeColor = (type: string): string => {
    const colors: { [key: string]: string } = {
      'Cita': '#4CAF50',
      'Almuerzo': '#FF9800',
      'Visita': '#2196F3',
      'Paseo': '#9C27B0',
      'Terapia': '#F44336',
      'Reunión': '#607D8B'
    };
    return colors[type] || '#757575';
  };

  const activityTypes = ['all', ...ACTIVITY_TYPES];
  const locations = ['all', ...ACTIVITY_LOCATIONS];
  const statuses = ['all', ...ACTIVITY_STATUSES];

  const clearFilters = () => {
    setFilterDate(undefined);
    setFilterType('all');
    setFilterLocation('all');
    setFilterStatus('all');
    setFilterResident('all');
  };

  const noActivities = activities.length === 0;

  return (
    <IonPage className="agenda-page">
      <Header title='Agenda'/>
      <IonContent className="ion-padding">
        <IonSegment value={currentView} onIonChange={(e) => handleViewChange(e.detail.value as 'daily' | 'weekly' | 'monthly')}>
          <IonSegmentButton value="daily">
            <IonLabel>Diaria</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="weekly">
            <IonLabel>Semanal</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="monthly">
            <IonLabel>Mensual</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {
        user.role !== 'Familiar' && (
          <IonButton expand="block" className="create-activity-button" onClick={() => setIsCreateModalOpen(true)}>
            <IonIcon icon={add} slot="start" />
            Crear Actividad
          </IonButton>
        )}

        <div className="agenda-filters">
          <IonItem>
            <IonLabel position="stacked">Fecha:</IonLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
              <div
                className="date-filter-display"
                onClick={() => setIsDateModalOpen(true)}
              >
                {filterDate ? format(parseISO(filterDate), 'dd MMM yyyy') : 'Seleccionar fecha'}
              </div>
              {filterDate && (
                <IonButton 
                  fill="clear" 
                  size="small" 
                  onClick={clearDateFilter}
                  style={{ minHeight: 'auto', minWidth: 'auto', padding: '4px' }}
                >
                  <IonIcon icon={close} style={{ fontSize: '16px' }} />
                </IonButton>
              )}
            </div>
            <IonModal isOpen={isDateModalOpen} onDidDismiss={() => setIsDateModalOpen(false)} keepContentsMounted={true} className="date-picker-modal">
              <IonDatetime
                id="filter-date-datetime"
                presentation="date"
                onIonChange={e => setFilterDate(e.detail.value ? format(parseISO(e.detail.value as string), 'yyyy-MM-dd') : undefined)}
              ></IonDatetime>
            </IonModal>
          </IonItem>

           <IonItem>
            <IonSelect
              label="Tipo de Actividad:"
              value={filterType}
              onIonChange={(e) => setFilterType(e.detail.value)}
              interface="popover"
            >
              {activityTypes.map(type => (
                <IonSelectOption key={type} value={type}>
                  {type === 'all' ? 'Todos' : type}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonSelect
              label="Lugar:"
              value={filterLocation}
              onIonChange={(e) => setFilterLocation(e.detail.value)}
              interface="popover"
            >
               {locations.map(location => (
                <IonSelectOption key={location} value={location}>
                  {location === 'all' ? 'Todos' : location}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>

           <IonItem>
            <IonSelect
              label="Estado:"
              value={filterStatus}
              onIonChange={(e) => setFilterStatus(e.detail.value)}
              interface="popover"
            >
               {statuses.map(status => (
                <IonSelectOption key={status} value={status}>
                  {status === 'all' ? 'Todos' : status}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonSelect
              label="Residente:"
              value={filterResident}
              onIonChange={(e) => setFilterResident(e.detail.value)}
              interface="popover"
            >
              <IonSelectOption value="all">Todos</IonSelectOption>
              {residents.map(resident => (
                <IonSelectOption key={resident.id} value={resident.id}>
                  {resident.nombre}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>

        </div>

        <IonButton expand ="block" className='clear-filter-activity-button' onClick={clearFilters}>
          Limpiar filtros
        </IonButton>
        
        {noActivities ? (
          <div className="no-activities-message" style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p>No hay actividades cargadas para mostrar.</p>
          </div>
        ): (
          <div className="agenda-activities">
            {currentView === 'daily' && (
              <div className="daily-view">
                <div className="daily-header">
                  <IonButton fill="clear" onClick={handlePreviousDay}>
                    <IonIcon icon={chevronBackOutline} />
                  </IonButton>
                  <div className="current-day">
                    {format(currentDay, 'EEEE, dd MMMM yyyy', { locale: es })}
                  </div>
                  <IonButton fill="clear" onClick={handleNextDay}>
                    <IonIcon icon={chevronForwardOutline} />
                  </IonButton>
                </div>

                <div className="daily-list">
                  {timeSlots.map((time, timeIndex) => (
                    <div key={timeIndex} className="daily-time-slot">
                      <div className="daily-time-label">{time}</div>
                      <div className="daily-activities-for-time">
                        {getActivitiesForTimeSlot(currentDay, time).map(activity => 
                          renderActivityBlock(activity)
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {currentView === 'weekly' && (
              <div className="weekly-view">
                <div className="weekly-header">
                  <IonButton fill="clear" onClick={handlePreviousWeek}>
                    <IonIcon icon={chevronBackOutline} />
                  </IonButton>
                  <div className="current-week">
                    {format(startOfWeek(currentDay, { weekStartsOn: 1 }), 'dd MMM', { locale: es })} - 
                    {format(endOfWeek(currentDay, { weekStartsOn: 1 }), 'dd MMM yyyy', { locale: es })}
                  </div>
                  <IonButton fill="clear" onClick={handleNextWeek}>
                    <IonIcon icon={chevronForwardOutline} />
                  </IonButton>
                </div>

                <div className="weekly-grid">
                  <div className="weekly-time-header">Horas</div>
                  {daysOfWeek.map((dayName, dayIndex) => {
                    const currentDate = addDays(startOfWeek(currentDay, { weekStartsOn: 1 }), dayIndex);
                    return (
                      <div key={dayIndex} className="weekly-day-header">
                        <div className="day-name">{dayName}</div>
                        <div className="day-date">{format(currentDate, 'dd', { locale: es })}</div>
                      </div>
                    );
                  })}
                  
                  {timeSlots.map((time, timeIndex) => (
                    <React.Fragment key={timeIndex}>
                      <div className="weekly-time-slot">
                        {time}
                      </div>
                      {daysOfWeek.map((_, dayIndex) => {
                        const currentDate = addDays(startOfWeek(currentDay, { weekStartsOn: 1 }), dayIndex);
                        const activitiesForSlot = getActivitiesForTimeSlot(currentDate, time);
                        return (
                          <div key={`${timeIndex}-${dayIndex}`} className="weekly-activity-cell">
                            <div className="weekly-activities-container">
                              {activitiesForSlot.map(activity =>
                                renderActivityBlock(activity)
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
            {currentView === 'monthly' && (
              <div className="monthly-view">
                <div className="monthly-header">
                  <IonButton fill="clear" onClick={handlePreviousMonth}>
                    <IonIcon icon={chevronBackOutline} />
                  </IonButton>
                  <div className="current-month-year">
                    {format(currentMonth, 'MMMM yyyy', { locale: es })}
                  </div>
                  <IonButton fill="clear" onClick={handleNextMonth}>
                    <IonIcon icon={chevronForwardOutline} />
                  </IonButton>
                </div>

                <div className="monthly-grid">
                  <div className="monthly-grid-header">
                    {daysOfWeek.map((day, index) => (
                      <div key={index} className="monthly-day-label">{day}</div>
                    ))}
                  </div>

                  {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="monthly-week-row">
                      {week.map((day, dayIndex) => (
                        <div 
                          key={`${weekIndex}-${dayIndex}`} 
                          className={`monthly-day-cell ${
                            !isSameMonth(day, currentMonth) ? 'outside-month' : ''
                          } ${isToday(day) ? 'today' : ''}`}
                        >
                          <div className="day-number">{format(day, 'd')}</div>
                          <div className="activities">
                            {getActivitiesForDay(day).map(activity =>
                              renderActivityBlock(activity)
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <CreateActivityModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleCreateActivity}
        />

        <ActivityModal
          isOpen={isActivityModalOpen}
          onClose={() => {
            setIsActivityModalOpen(false);
            setSelectedActivity(null);
            setIsEditing(false);
          }}
          onSave={handleActivitySave}
          onDelete={handleActivityDelete}
          activity={selectedActivity}
          residents={residents}
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
        />
      </IonContent>
    </IonPage>
  );
};

export default Agenda; 