import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonIcon, IonButton, IonSegment, IonSegmentButton, IonLabel, IonItem, IonInput, IonSelect, IonSelectOption, IonDatetime, IonDatetimeButton, IonModal } from '@ionic/react';
import { add, chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import './Agenda.css';
import logo from '../assets/logo.png';
import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, isSameMonth, isToday, addDays, parseISO } from 'date-fns';
import { eachDayOfInterval } from 'date-fns/eachDayOfInterval';
import { es } from 'date-fns/locale';

const Agenda: React.FC = () => {
  const [currentView, setCurrentView] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentDay, setCurrentDay] = useState(new Date());

  const [filterDate, setFilterDate] = useState<string | undefined>(undefined);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [isDateModalOpen, setIsDateModalOpen] = useState(false);

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

  const daysOfWeek = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
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

  const placeholderActivities = useMemo(() => [
    { date: new Date(2025, 3, 1, 11, 0), title: 'Cita Oftalmólogo', type: 'Cita', resident: 'Joaquin', location: 'Hospital', status: 'Completo' },
    { date: new Date(2025, 3, 1, 12, 0), title: 'Almuerzo con familiares', type: 'Almuerzo', resident: 'Joaquin', location: 'Interno', status: 'Incompleto' },
    { date: new Date(2025, 3, 4, 14, 0), title: 'Visita Familiares', type: 'Visita', resident: 'Joaquin', location: 'Interno', status: 'Incompleto' },
    { date: new Date(2025, 3, 4, 15, 0), title: 'Paseo', type: 'Paseo', resident: 'Joaquin', location: 'Exterior', status: 'Completo' },
    { date: new Date(2025, 3, 8, 10, 0), title: 'Terapia física', type: 'Terapia', resident: 'Joaquin', location: 'Gimnasio', status: 'Completo' },
    { date: new Date(2025, 3, 8, 14, 30), title: 'Reunión de cuidadores', type: 'Reunión', resident: '-', location: 'Sala de estar', status: 'Incompleto' },
  ], []);

  const filterActivities = (activities: any[]) => {
    return activities.filter(activity => {
      const activityDate = new Date(activity.date);
      const filterD = filterDate ? parseISO(filterDate) : null;

      const dateMatch = filterD ?
        activityDate.getFullYear() === filterD.getFullYear() &&
        activityDate.getMonth() === filterD.getMonth() &&
        activityDate.getDate() === filterD.getDate()
        : true;

      const typeMatch = filterType === 'all' || activity.type === filterType;
      const locationMatch = filterLocation === 'all' || activity.location === filterLocation;
      const statusMatch = filterStatus === 'all' || activity.status === filterStatus;

      return dateMatch && typeMatch && locationMatch && statusMatch;
    });
  };

  const getActivitiesForDay = (day: Date) => { 
    const activitiesOnDay = placeholderActivities.filter(activity =>
      isSameMonth(activity.date, day) &&
      format(activity.date, 'dd/MM/yyyy') === format(day, 'dd/MM/yyyy')
    );
    return filterActivities(activitiesOnDay);
  };

  const getActivitiesForTimeSlot = (day: Date, time: string) => { 
    const [hour, minute] = time.split(':').map(Number);
    const activitiesAtTime = placeholderActivities.filter(activity =>
      isSameMonth(activity.date, day) &&
      activity.date.getHours() === hour &&
      activity.date.getMinutes() === minute
    );
    return filterActivities(activitiesAtTime);
  };

  // Dummy filter options (replace with actual data)
  const activityTypes = ['all', 'Cita', 'Almuerzo', 'Visita', 'Paseo', 'Terapia', 'Reunión'];
  const locations = ['all', 'Hospital', 'Interno', 'Exterior', 'Gimnasio', 'Sala de estar'];
  const statuses = ['all', 'Completo', 'Incompleto'];

  return (
    <IonPage className="agenda-page">
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <div className="header-content">
            <img src={logo} alt="Logo" className="header-logo" />
            <IonTitle>Agenda</IonTitle>
          </div>
        </IonToolbar>
      </IonHeader>
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

        <IonButton expand="block" className="create-activity-button" onClick={() => setIsCreateModalOpen(true)}>
           <IonIcon icon={add} slot="start" />
           Crear Actividad
        </IonButton>

        <div className="agenda-filters">
          <IonItem>
            <IonLabel position="stacked">Fecha:</IonLabel>
            <div
              className="date-filter-display"
              onClick={() => setIsDateModalOpen(true)}
            >
              {filterDate ? format(parseISO(filterDate), 'dd MMM yyyy') : 'Seleccionar fecha'}
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
            <IonLabel position="stacked">Tipo de Actividad:</IonLabel>
            <IonSelect
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
            <IonLabel position="stacked">Lugar:</IonLabel>
            <IonSelect
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
            <IonLabel position="stacked">Estado:</IonLabel>
            <IonSelect
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

        </div>

        <div className="agenda-activities">
          {currentView === 'daily' && (
            <div className="daily-view">
              <div className="daily-header">
                <IonButton fill="clear" onClick={handlePreviousDay}>
                  <IonIcon icon={chevronBackOutline} />
                </IonButton>
                <div className="current-day">{format(currentDay, 'EEEE, dd MMMM yyyy', { locale: es })}</div>
                <IonButton fill="clear" onClick={handleNextDay}>
                  <IonIcon icon={chevronForwardOutline} />
                </IonButton>
              </div>

              <div className="daily-list">
                {timeSlots.map((time, timeIndex) => (
                  <div key={timeIndex} className="daily-time-slot">
                    <div className="daily-time-label">{time}</div>
                    <div className="daily-activities-for-time">
                      {filterActivities(getActivitiesForTimeSlot(currentDay, time)).map((activity, activityIndex) => (
                         <div key={activityIndex} className="activity-block">
                           {activity.title} ({activity.type})
                         </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
          {currentView === 'weekly' && (
            <div className="weekly-view">
              <div className="weekly-header">
                <IonButton fill="clear">
                  <IonIcon icon={chevronBackOutline} />
                </IonButton>
                <div className="current-month-year">{format(currentMonth, 'MMMM - yyyy', { locale: es })}</div>
                <IonButton fill="clear">
                  <IonIcon icon={chevronForwardOutline} />
                </IonButton>
              </div>

              <div className="weekly-grid">
                <div className="time-column">Horas</div>
                {daysOfWeek.map((day, index) => (
                  <div key={index} className="day-label">{day}</div>
                ))}
                {timeSlots.map((time, timeIndex) => (
                  <>
                    <div key={timeIndex} className="time-slot-label">{time}</div>
                    {daysOfWeek.map((day, dayIndex) => (
                      <div key={`${timeIndex}-${dayIndex}`} className="activity-cell"></div>
                    ))}
                  </>
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
                <div className="current-month-year">{format(currentMonth, 'MMMM - yyyy', { locale: es })}</div>
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
                      <div key={`${weekIndex}-${dayIndex}`} className={`monthly-day-cell ${!isSameMonth(day, currentMonth) ? 'outside-month' : ''} ${isToday(day) ? 'today' : ''}`}>
                        <div className="day-number">{format(day, 'd')}</div>
                        <div className="activities">
                          {filterActivities(getActivitiesForDay(day)).map((activity, activityIndex) => (
                            <div key={activityIndex} className="activity-block">
                              {activity.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </IonContent>
    </IonPage>
  );
};

export default Agenda; 