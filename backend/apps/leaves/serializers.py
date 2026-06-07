from rest_framework import serializers
from apps.employees.models import Employee
from .models import LeaveRequest

class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField(read_only=True)
    employee_id = serializers.PrimaryKeyRelatedField(
        queryset=Employee.objects.all(), 
        source='employee',
        required=False
    )

    class Meta:
        model = LeaveRequest
        fields = (
            'id', 'employee_id', 'employee_name', 'start_date', 
            'end_date', 'reason', 'status', 'created_at'
        )
        read_only_fields = ('id', 'status', 'created_at')

    def get_employee_name(self, obj):
        return f"{obj.employee.prenom} {obj.employee.nom}"

    def validate(self, data):
        start_date = data.get('start_date')
        end_date = data.get('end_date')

        if start_date and end_date:
            if start_date > end_date:
                raise serializers.ValidationError(
                    {"end_date": "La date de fin doit être après ou égale à la date de début."}
                )
        return data
